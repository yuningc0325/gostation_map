  /// my-map-controller.js
  import { MapController } from 'react-map-gl'

  export default class MyMapController extends MapController {

    constructor() {
      super();
      // subscribe to additional events
      this.events = ['click']
      // this.events = ['hover']
    }

    // Override the default handler in MapController
    handleEvent(event) {
      console.log(event.type)
      if (event.type === 'click') {
        console.log(event)
      }

      if(event.type === 'hover'){
        console.log('hover event trigger')
      }
      
      return super.handleEvent(event);
    }
  }