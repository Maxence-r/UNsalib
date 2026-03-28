import { parseStringPromise } from "xml2js";
import { parse } from "node-html-parser";

import {
    getDateFromFrenchDateString,
    getDateFromWeeksMap,
    setDateTimeFromTimeString,
} from "./date.js";

interface NormalizedCourse {
    celcatId: string;
    start: Date;
    end: Date;
    category?: string;
    color: string;
    rooms: string[];
    teachers: string[];
    modules: string[];
}

interface UnivGroup {
    univId: number;
    name: string;
}

interface CelcatGroup {
    celcatId: number;
    name: string;
}

type ItemizedList = {
    item: (
        | {
              a: {
                  _: string;
                  $: { href: string };
              }[];
          }
        | string
    )[];
}[];

interface CelcatCoursesXml {
    timetable: {
        span: {
            $: { id: string; date: string };
            description: string[];
            title: string[];
            alleventweeks: string[];
            day: {
                $: { id: string };
                name: string[];
                row: { $: { id: string } }[];
            }[];
        }[];
        event: {
            $: {
                id: string;
                timesort: string;
                colour: string;
            };
            day: string[];
            starttime: string[];
            endtime: string[];
            category: string[];
            rawweeks: string[];
            resources: {
                room: ItemizedList;
                module: ItemizedList;
                staff: ItemizedList;
            }[];
        }[];
    };
}

type UnivJsonCourses = {
    id: number;
    celcat_id: string;
    categories: string;
    start_at: string;
    end_at: string;
    color: string;
    place_id: number;
    rooms_for_blocks: string;
    rooms_for_item_details: string;
    teachers_for_blocks: string;
    teachers_for_item_details: string;
    educational_groups_for_blocks: string;
    educational_groups_for_item_details: string;
    modules_for_blocks: string;
    modules_for_item_details: string;
}[];

async function extractCoursesFromCelcatXml(
    xml: string,
): Promise<NormalizedCourse[]> {
    const normalizedCourses: NormalizedCourse[] = [];
    const parsedXml = (await parseStringPromise(xml)) as CelcatCoursesXml;
    const baseDate = parsedXml.timetable.span[0].$.date;

    const parseItemizedList = (l: ItemizedList): string[] =>
        l[0].item.map((i) => {
            if (typeof i === "string") {
                return i;
            }
            return i.a[0]._;
        });

    for (const event of parsedXml.timetable.event) {
        const day = getDateFromWeeksMap(
            event.rawweeks[0],
            parseInt(event.day[0]),
            getDateFromFrenchDateString(baseDate),
        );
        const start = setDateTimeFromTimeString(
            structuredClone(day),
            event.starttime[0],
        );
        const end = setDateTimeFromTimeString(
            structuredClone(day),
            event.endtime[0],
        );

        normalizedCourses.push({
            celcatId: event.$.id,
            rooms: event.resources[0].room
                ? parseItemizedList(event.resources[0].room)
                : [],
            teachers: event.resources[0].staff
                ? parseItemizedList(event.resources[0].staff)
                : [],
            modules: event.resources[0].module
                ? parseItemizedList(event.resources[0].module)
                : [],
            color: event.$.colour,
            start: start,
            end: end,
            ...(event.category.length > 0 && {
                category: event.category[0],
            }),
        });
    }

    return normalizedCourses;
}

function extractGroupsFromCelcatHtml(html: string): CelcatGroup[] {
    const docRoot = parse(html);
    const selectElm = docRoot.querySelector("select");
    const optionElms = selectElm?.querySelectorAll("option");

    const foundGroups: CelcatGroup[] = [];

    if (optionElms) {
        for (const elm of optionElms) {
            const stringId = elm.getAttribute("value")?.match(/[0-9]+/);
            const groupId = parseInt(stringId ? stringId[0] : "");
            const groupName = elm.innerText.trim().replaceAll("&amp;", "&");

            if (
                !isNaN(groupId) &&
                groupName &&
                !foundGroups.some((g) => g.name === groupName)
            ) {
                foundGroups.push({
                    celcatId: groupId,
                    name: groupName,
                });
            }
        }
    }

    return foundGroups;
}

function extractCoursesFromUnivJson(json: string): NormalizedCourse[] {
    const normalizedCourses: NormalizedCourse[] = [];
    const parsedJson = JSON.parse(json) as UnivJsonCourses;

    // Split a string present in the data supplied by the University
    // (blocks separated by ;) and return an array of elements
    const splitUnivDataBlocks = (blocks: string): string[] =>
        blocks && blocks !== ""
            ? blocks.split(";").map((item) => item.trim())
            : [];

    for (const course of parsedJson) {
        normalizedCourses.push({
            celcatId: course.celcat_id,
            start: new Date(course.start_at),
            end: new Date(course.end_at),
            rooms: splitUnivDataBlocks(course.rooms_for_blocks),
            teachers: splitUnivDataBlocks(course.teachers_for_blocks),
            modules: splitUnivDataBlocks(course.modules_for_blocks),
            color: course.color,
            ...(course.categories && { category: course.categories }),
        });
    }

    return normalizedCourses;
}

function extractGroupsFromUnivHtml(html: string): UnivGroup[] {
    // Get the timetable HTML page to extract groups checkboxes
    const docRoot = parse(html);
    const groupInputs = docRoot.querySelectorAll(
        "#desktopGroupForm #educational_groups input",
    );

    const foundGroups: UnivGroup[] = [];

    for (const input of groupInputs) {
        // Get the ID and name for each group checkbox
        const groupId = parseInt(input.getAttribute("value") || "");
        const labelElement = docRoot.querySelector(`label[for="${input.id}"]`);
        const groupName = labelElement?.textContent
            .trim()
            .replaceAll("&amp;", "&");

        if (
            !isNaN(groupId) &&
            groupName &&
            !foundGroups.some((g) => g.name === groupName)
        ) {
            foundGroups.push({
                univId: groupId,
                name: groupName,
            });
        }
    }

    return foundGroups;
}

export {
    extractCoursesFromCelcatXml,
    extractGroupsFromCelcatHtml,
    extractCoursesFromUnivJson,
    extractGroupsFromUnivHtml,
    type UnivGroup,
    type CelcatGroup,
    type NormalizedCourse,
};
