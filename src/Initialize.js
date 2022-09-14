import Map from './Map'

export default class Initialize {
  constructor(opt) {
    const self = this
    const maps = []

    const mapElements = self.getMapElements()
    const markers = self.getDomMarkers()

    mapElements.forEach(function (element) {
      // Filter relevant markers
      const types = (typeof element.dataset.type === 'undefined') ? [''] : element.dataset.type.split(',')
      const filteredMarkers = markers.filter(function (marker) {
        return marker.type ? (marker.type.indexOf(types) > -1) : true
      }, types)
      const overlays = (typeof element.dataset.overlays === 'undefined') ? [''] : element.dataset.overlays.split(',')
      const filteredOverlays = opt.overlays ? opt.overlays.filter(function (e) {
        return e.name ? (e.name.indexOf(overlays) > -1) : true
      }) : []

      const autoView = element.dataset.center === 'auto'
      const center = element.dataset.centerLon ? [
        Number(element.dataset.centerLon),
        Number(element.dataset.centerLat)
      ] : 'auto'

      this._map = new Map({
        target: element.id,
        token: element.dataset.token,
        username: element.dataset.username,
        password: element.dataset.password,
        background: element.dataset.background,
        icons: opt.icons,
        overlays: filteredOverlays,
        markers: filteredMarkers,
        markerTypes: types,
        popup: opt.popup,
        showPopup: element.dataset.showPopup !== 'false',
        zoomSlider: element.dataset.zoomslider === 'true',
        fullScreen: element.dataset.fullscreen === 'true',
        myLocation: element.dataset.mylocation === 'true',
        scaleLine: element.dataset.scaleline === 'true',
        layerSwitcher: element.dataset.layerswitcher === 'true',
        extent: element.dataset.extent ? JSON.parse(element.dataset.extent) : null,
        view: {
          center: autoView ? 'auto' : center,
          zoom: element.dataset.zoom
        }
      })
      maps.push(this._map)
    }, opt, markers)

    self.listenForDynamicComponents()

    self._maps = maps
    return maps
  }

  getDomMarkers() {
    // Push the marker DOM elements into an array.
    const markerElementsO = document.querySelectorAll('span.geomarker')

    // IE support
    const markerElements = []

    for (let i = 0; i < markerElementsO.length; i++) {
      markerElements.push(markerElementsO[i])
    }

    let markers = []

    markerElements.forEach(function (element) {
      const dataset = element.dataset
      let marker = {}

      for (let key in dataset) {
        if (key === 'lat' || key === 'lon') {
          marker[key] = Number(dataset[key])
        } else {
          marker[key] = dataset[key]
        }
      }
      markers.push(marker)
    }, markers)

    return markers
  }

  getMapElements() {
    // Target all map dom elements with the geomap class set
    const mapElementsO = document.querySelectorAll('div.geomap')

    const mapElements = []

    for (let i = 0; i < mapElementsO.length; i++) {
      mapElements.push(mapElementsO[i])
    }

    return mapElements
  }

  listenForDynamicComponents() {
    const observer = new MutationObserver((mutations) => {
      console.log('dom updated')
      const markers = this.getDomMarkers()
      this._maps.forEach(map => {
        // Filter relevant markers
        const types = map.markerTypes
        const filteredMarkers = markers.filter(function (marker) {
          return marker.type ? (marker.type.indexOf(types) > -1) : true
        }, types)
        // map.updateMarkers(filteredMarkers)
      })
    })
    observer.observe(document.body, {
      attributes: false,
      characterData: false,
      childList: true,
      subtree: true,
      attributeOldValue: false,
      characterDataOldValue: false
    })
  }
}
