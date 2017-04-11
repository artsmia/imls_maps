// passing leaflet as `L` is a hack because next.js can't handle server side leaflet
export default function getPaddedBoundsFromLayer(layer, pad, L) {
  if(!L) return console.error('getPaddedBoundsFromLayer called with undefined `L`eaflet')

  if(layer.length) {
    // L.geoJson can't deal with a layer of layers, so get all the individual markers
    // from the direct children of this layer
    var deNestedLayers = layer.reduce(
      (all, l) => all.concat(Object.values(l._layers)),
      []
    )
    layer = L.layerGroup(deNestedLayers)
  }

  return L.geoJson(layer.toGeoJSON())
  .getBounds()
  .pad(pad)
}

