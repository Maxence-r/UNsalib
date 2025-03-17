document.addEventListener('DOMContentLoaded', () => {
    const actionsContainer = document.querySelector('.actions_container');
    const tabs = Array.from(document.querySelectorAll('.action'));
    
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    // Current displayed content elements
    const edtFinder = document.querySelector('.edt-finder');
    const roomFinder = document.querySelector('.room-finder');
    
    // Add transition for smooth swipe effect
    edtFinder.style.transition = 'opacity 0.3s ease';
    roomFinder.style.transition = 'opacity 0.3s ease';
    
    // Configure content containers for horizontal layout
    actionsContainer.style.display = 'flex';
    actionsContainer.style.flexDirection = 'row';
    actionsContainer.style.width = '200%';
    actionsContainer.style.transition = 'transform 0.3s ease';
    
    edtFinder.style.width = '50%';
    roomFinder.style.width = '50%';
    
    // Touch event handlers
    actionsContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    actionsContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    actionsContainer.addEventListener('touchend', handleTouchEnd);
    
    // Mouse event handlers for desktop testing
    actionsContainer.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    function handleTouchStart(e) {
        startX = e.touches[0].clientX;
        isDragging = true;
        startDrag();
    }
    
    function handleTouchMove(e) {
        if (!isDragging) return;
        
        currentX = e.touches[0].clientX;
        const deltaX = currentX - startX;
        
        // Determine which way to drag based on current active tab
        const activeTabIndex = tabs.findIndex(tab => tab.classList.contains('tab-active'));
        
        // Apply drag effect with resistance at edges
        let translateX = deltaX;
        
        // Add resistance when trying to drag beyond the tabs
        if ((activeTabIndex === 0 && deltaX > 0) || (activeTabIndex === 1 && deltaX < 0)) {
            translateX = deltaX / 3; // Reduce drag distance for resistance effect
        }
        
        // Base position determined by active tab
        const baseTransform = (activeTabIndex === 0) ? 0 : -50;
        
        // Apply transform with percentage for smooth dragging
        actionsContainer.style.transform = `translateX(calc(${baseTransform}% + ${translateX}px))`;
        
        // Adjust opacity during swipe for a more native feel
        if (activeTabIndex === 0 && deltaX < 0) {
            // Swiping from first to second tab
            const progress = Math.min(1, Math.abs(deltaX) / (window.innerWidth * 0.4));
            edtFinder.style.opacity = 1 - progress * 0.5;
            roomFinder.style.opacity = progress;
        } else if (activeTabIndex === 1 && deltaX > 0) {
            // Swiping from second to first tab
            const progress = Math.min(1, Math.abs(deltaX) / (window.innerWidth * 0.4));
            edtFinder.style.opacity = progress;
            roomFinder.style.opacity = 1 - progress * 0.5;
        }
        
        e.preventDefault(); // Prevent scrolling while swiping
    }
    
    function handleTouchEnd() {
        if (!isDragging) return;
        
        const deltaX = currentX - startX;
        const activeTabIndex = tabs.findIndex(tab => tab.classList.contains('tab-active'));
        
        // Determine if swipe was significant enough to change tabs
        const threshold = window.innerWidth * 0.15; // 15% of screen width
        
        if (Math.abs(deltaX) > threshold) {
            // Swipe was significant
            if (deltaX > 0 && activeTabIndex === 1) {
                // Swipe right when on second tab - go to first tab
                switchToTab(0);
            } else if (deltaX < 0 && activeTabIndex === 0) {
                // Swipe left when on first tab - go to second tab
                switchToTab(1);
            } else {
                // Reset to current tab position
                resetPosition();
            }
        } else {
            // Swipe was not significant - reset position
            resetPosition();
        }
        
        isDragging = false;
    }
    
    // Mouse event equivalents
    function handleMouseDown(e) {
        startX = e.clientX;
        isDragging = true;
        startDrag();
    }
    
    function handleMouseMove(e) {
        if (!isDragging) return;
        
        currentX = e.clientX;
        const deltaX = currentX - startX;
        
        const activeTabIndex = tabs.findIndex(tab => tab.classList.contains('tab-active'));
        
        let translateX = deltaX;
        if ((activeTabIndex === 0 && deltaX > 0) || (activeTabIndex === 1 && deltaX < 0)) {
            translateX = deltaX / 3;
        }
        
        const baseTransform = (activeTabIndex === 0) ? 0 : -50;
        actionsContainer.style.transform = `translateX(calc(${baseTransform}% + ${translateX}px))`;
        
        // Adjust opacity during mouse swipe
        if (activeTabIndex === 0 && deltaX < 0) {
            const progress = Math.min(1, Math.abs(deltaX) / (window.innerWidth * 0.4));
            edtFinder.style.opacity = 1 - progress * 0.5;
            roomFinder.style.opacity = progress;
        } else if (activeTabIndex === 1 && deltaX > 0) {
            const progress = Math.min(1, Math.abs(deltaX) / (window.innerWidth * 0.4));
            edtFinder.style.opacity = progress;
            roomFinder.style.opacity = 1 - progress * 0.5;
        }
    }
    
    function handleMouseUp() {
        handleTouchEnd();
    }
    
    function switchToTab(index) {
        // Remove active class from current tab
        const currentActiveTab = document.querySelector('.tab-active');
        if (currentActiveTab) {
            currentActiveTab.classList.remove('tab-active');
        }
        
        // Add active class to new tab
        tabs[index].classList.add('tab-active');
        
        // Set container position based on active tab - this fixes the bug!
        actionsContainer.style.transition = 'transform 0.3s ease';
        actionsContainer.style.transform = index === 0 ? 'translateX(0%)' : 'translateX(-50%)';
        
        // Update displayed content and animate opacity
        if (index === 0) {
            edtFinder.classList.add('displayed');
            roomFinder.classList.remove('displayed');
            edtFinder.style.opacity = 1;
            roomFinder.style.opacity = 0;
        } else {
            edtFinder.classList.remove('displayed');
            roomFinder.classList.add('displayed');
            edtFinder.style.opacity = 0;
            roomFinder.style.opacity = 1;
        }
    }
    
    function resetPosition() {
        const activeTabIndex = tabs.findIndex(tab => tab.classList.contains('tab-active'));
        actionsContainer.style.transition = 'transform 0.3s ease';
        actionsContainer.style.transform = activeTabIndex === 0 ? 'translateX(0%)' : 'translateX(-50%)';
        
        // Also reset opacity
        if (activeTabIndex === 0) {
            edtFinder.style.opacity = 1;
            roomFinder.style.opacity = 0;
        } else {
            edtFinder.style.opacity = 0;
            roomFinder.style.opacity = 1;
        }
    }
    
    function startDrag() {
        // Remove transition during drag for more responsive feel
        actionsContainer.style.transition = 'none';
    }
    
    // Update container position when tab is clicked (from menuManager.js)
    document.querySelectorAll(".action").forEach((el) => {
        el.addEventListener("click", () => {
            // After click handler runs, reset position with animation
            setTimeout(() => {
                const activeTabIndex = tabs.findIndex(tab => tab.classList.contains('tab-active'));
                actionsContainer.style.transition = 'transform 0.3s ease';
                actionsContainer.style.transform = activeTabIndex === 0 ? 'translateX(0%)' : 'translateX(-50%)';
                
                // Set proper opacity states
                if (activeTabIndex === 0) {
                    edtFinder.style.opacity = 1;
                    roomFinder.style.opacity = 0;
                } else {
                    edtFinder.style.opacity = 0;
                    roomFinder.style.opacity = 1;
                }
            }, 0);
        });
    });
});
