export class Slider {
    constructor(containerId, newValueCallback, initialValue, minValue, maxValue) {
        this.newValueCallback = newValueCallback;
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.valuePercentage = (initialValue - minValue) / (maxValue - minValue);

        let slider_container = document.getElementById(containerId);

        this.track = document.createElement('div');
        this.track.classList.add('slider_track');

        this.handle = document.createElement('div');
        this.handle.classList.add('slider_handle');

        this.track.appendChild(this.handle);
        slider_container.appendChild(this.track);

        this.isDragging = false;

        this.handle.style.left = this.valuePercentage * this.getTrackWidth() + 'px';

        const moveHandle = (e) => {
            const { pageX } = e.touches ? e.touches[0] : e;
            let handleRelativeX = pageX - this.track.offsetLeft - (this.handle.clientWidth / 2);
    
            const trackWidth = this.getTrackWidth();
            if (handleRelativeX < 0) handleRelativeX = 0;
            if (handleRelativeX > trackWidth) handleRelativeX = trackWidth;

            this.handle.style.left = handleRelativeX + 'px';
    
            this.valuePercentage = handleRelativeX / trackWidth;
            const newValue = this.minValue + (this.maxValue - this.minValue) * this.valuePercentage;
            newValueCallback(newValue);
            console.log(this.valuePercentage, newValue);
        }

        window.addEventListener('resize', () => {
            const handleRelativeX = this.valuePercentage * this.getTrackWidth();
            this.handle.style.left = handleRelativeX + 'px'
        });
    
    
        this.handle.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            moveHandle(e);
        });
        this.handle.addEventListener('touchstart', (e) => {
            this.isDragging = true;
            moveHandle(e);
        });
        this.track.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            moveHandle(e);
        });
        this.track.addEventListener('touchstart', (e) => {
            this.isDragging = true;
            moveHandle(e);
        });
    
    
        window.addEventListener('mouseup', () => (this.isDragging = false));
        window.addEventListener('touchend', () => (this.isDragging = false));
    
    
        window.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                document.body.style.cursor = 'pointer';
                document.body.style.userSelect = 'none'; // prevent text selection while dragging
                moveHandle(e);
            } else {
                document.body.style.cursor = 'default';
                document.body.style.userSelect = 'auto';
            }
        });

        window.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                e.preventDefault(); // prevent scrolling on mobile
                moveHandle(e);
            }
        }, { passive: false });
    }

    getTrackWidth() {
        return this.track.offsetWidth - this.handle.clientWidth;
    }
}