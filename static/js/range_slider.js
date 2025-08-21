export class Slider {
   constructor(containerId, newValueCallback, initialValue, minValue, maxValue) {
      this.newValueCallback = newValueCallback;
      this.minValue = minValue;
      this.maxValue = maxValue;
      this.valuePercentage = (initialValue - minValue) / (maxValue - minValue);

      let slider_container = document.getElementById(containerId);

      // this.track = document.createElement('div');
      // this.track.classList.add('slider_track');
      this.track = slider_container.querySelector('.slider_track');

      // this.handle = document.createElement('div');
      // this.handle.classList.add('slider_handle');
      this.handle = slider_container.querySelector('.slider_handle');

      this.track.appendChild(this.handle);
      slider_container.appendChild(this.track);

      this.isDragging = false;

      this.handle.style.left = this.valuePercentage * this.getTrackWidth() + 'px';

      const moveHandle = (e) => {
         const { pageX } = e.touches ? e.touches[0] : e;
         const handleHalfWidth = this.handle.clientWidth / 2;
         let handleRelativeX = pageX - this.track.offsetLeft - handleHalfWidth;
    
         const trackWidth = this.getTrackWidth();
         // Allow handle to overhang by half its width on both ends
         if (handleRelativeX < -handleHalfWidth) handleRelativeX = -handleHalfWidth;
         if (handleRelativeX > trackWidth - handleHalfWidth) handleRelativeX = trackWidth - handleHalfWidth;

         this.handle.style.left = handleRelativeX + 'px';
    
         // Calculate value percentage based on the effective track range
         const effectiveTrackWidth = trackWidth + this.handle.clientWidth;
         const effectiveHandleX = handleRelativeX + handleHalfWidth;
         this.valuePercentage = effectiveHandleX / effectiveTrackWidth;
         const newValue = this.minValue + (this.maxValue - this.minValue) * this.valuePercentage;
         newValueCallback(newValue);
      }

      window.addEventListener('resize', () => {
         const handleRelativeX = this.valuePercentage * this.getTrackWidth();
         this.handle.style.left = handleRelativeX + 'px'
      });
    
    
      this.handle.addEventListener('mousedown', (e) => {
         this.isDragging = true;
         this.track.style.cursor = 'grabbing';
         this.handle.style.cursor = 'grabbing';
         document.body.style.userSelect = 'none'; // prevent text selection while dragging
         moveHandle(e);
      });
      this.handle.addEventListener('touchstart', (e) => {
         this.isDragging = true;
         this.track.style.cursor = 'grabbing';
         this.handle.style.cursor = 'grabbing';
         document.body.style.userSelect = 'none'; // prevent text selection while dragging
         moveHandle(e);
      });
      this.track.addEventListener('mousedown', (e) => {
         this.isDragging = true;
         this.track.style.cursor = 'grabbing';
         this.handle.style.cursor = 'grabbing';
         document.body.style.userSelect = 'none'; // prevent text selection while dragging
         moveHandle(e);
      });
      this.track.addEventListener('touchstart', (e) => {
         this.isDragging = true;
         this.track.style.cursor = 'grabbing';
         this.handle.style.cursor = 'grabbing';
         document.body.style.userSelect = 'none'; // prevent text selection while dragging
         moveHandle(e);
      });
    
    
      window.addEventListener('mouseup', () => {
         this.isDragging = false;
         this.track.style.cursor = '';
         this.handle.style.cursor = '';
      });
      window.addEventListener('touchend', () => {
         this.isDragging = false;
         this.track.style.cursor = '';
         this.handle.style.cursor = '';
      });
    
    
      window.addEventListener('mousemove', (e) => {
         if (this.isDragging) {
            document.body.style.userSelect = 'none'; // prevent text selection while dragging
            moveHandle(e);
         } else {
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
      return this.track.offsetWidth;
   }
}