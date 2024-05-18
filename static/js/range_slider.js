export class Slider {
    constructor(containerId, newValueCallback, initialValue, minValue, maxValue) {
        this.newValueCallback = newValueCallback;
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.valuePercentage = (initialValue - minValue) / (maxValue - minValue);

        let slider_container = document.getElementById(containerId);

        this.track = document.createElement("div");
        this.track.classList.add("slider_track");
        this.handle = document.createElement("div");
        this.handle.classList.add("slider_handle");

        this.track.appendChild(this.handle);
        slider_container.appendChild(this.track);

        this.isDragging = false;

        this.handle.style.left = this.track.offsetWidth * this.valuePercentage - this.handle.clientWidth /2 + 'px';

    }

}


export function initSlider(newValueCallback, initialValue, minValue, maxValue) {
    var sliderPercentage = (initialValue - minValue) / (maxValue - minValue);
    var slider = document.getElementById('stiffnessSlider');
    var sliderWidth = slider.offsetWidth;
    var handle = document.getElementById('stiffnessHandle');
    var handleWidth = handle.clientWidth;
    var isDragging = false;
    handle.style.left = sliderWidth * sliderPercentage - handleWidth/2 + 'px';

    const moveHandle = (e) => {
        const { pageX } = e.touches ? e.touches[0] : e;
        let x = pageX - slider.offsetLeft - handleWidth / 2;

        if (x < 0) x = 0;
        if (x > sliderWidth - handleWidth) x = sliderWidth - handleWidth;
        handle.style.left = x + 'px';

        sliderPercentage = x /(sliderWidth - handleWidth);
        let newValue = minValue + (maxValue - minValue) * sliderPercentage;
        newValueCallback(newValue);
    }

    window.addEventListener('resize', function() {
        sliderWidth = slider.offsetWidth;
        x = sliderPercentage * sliderWidth - handleWidth / 2;
        handle.style.left = x + 'px'
    });


    handle.addEventListener('mousedown', (e) => {
        isDragging = true;
        moveHandle(e);
    });
    handle.addEventListener('touchstart', (e) => {
        isDragging = true;
        moveHandle(e);
    });

    slider.addEventListener('mousedown', (e) => {
        isDragging = true;
        moveHandle(e);
    });
    slider.addEventListener('touchstart', (e) => {
        isDragging = true;
        moveHandle(e);
    });


    window.addEventListener('mouseup', () => (isDragging = false));
    window.addEventListener('touchend', () => (isDragging = false));


    window.addEventListener('mousemove', function(e) {
        if (isDragging) {
            document.body.style.cursor = 'pointer';
            document.body.style.userSelect = 'none';
            moveHandle(e);
        } else {
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        }
    });
    window.addEventListener('touchmove', function(e) {
        if (isDragging) {
            e.preventDefault(); // prevent scrolling on mobile
            moveHandle(e);
        }
    }, { passive: false });
}
