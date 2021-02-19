function getColorFromPropertiesWithDefault(defaultColor: string, key = 'user_color') {
  return ['case',
    ['has', key], ['get', key],
    defaultColor
  ]
}

export const routePlannerStyles = (defaultColor: string) => [
  // ACTIVE (being drawn)
  // line stroke
  {
    'id': 'gl-draw-line',
    'type': 'line',
    'filter': ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      // get color from geojson feature properties
      'line-color': getColorFromPropertiesWithDefault(defaultColor)
    }
  },
  // polygon fill
  {
    'id': 'gl-draw-polygon-fill',
    'type': 'fill',
    'filter': ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    'paint': {
      // get color from geojson feature properties
      'fill-color': getColorFromPropertiesWithDefault(defaultColor),
      'fill-opacity': 0.1
    }
  },
  // polygon outline stroke
  // This doesn't style the first edge of the polygon, which uses the line stroke styling instead
  {
    'id': 'gl-draw-polygon-stroke-active',
    'type': 'line',
    'filter': ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      // get color from geojson feature properties
      'line-color': getColorFromPropertiesWithDefault(defaultColor),
    }
  },

  // vertex point halos
  {
    'id': 'gl-draw-polygon-and-line-vertex-halo-active',
    'type': 'circle',
    'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    'paint': {
      'circle-radius': 5,
      'circle-color': getColorFromPropertiesWithDefault(defaultColor)
    }
  },
  // vertex points
  {
    'id': 'gl-draw-polygon-and-line-vertex-active',
    'type': 'circle',
    'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    'paint': {
      'circle-radius': 3,
      'circle-color': getColorFromPropertiesWithDefault(defaultColor)
    }
  },

  // INACTIVE (static, already drawn)
  // line stroke
  {
    'id': 'gl-draw-line-static',
    'type': 'line',
    'filter': ['all', ['==', '$type', 'LineString'], ['==', 'mode', 'static']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      // get color from geojson feature properties
      'line-color': getColorFromPropertiesWithDefault(defaultColor)
    }
  },
  // polygon fill
  {
    'id': 'gl-draw-polygon-fill-static',
    'type': 'fill',
    'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'static']],
    'paint': {
      // get color from geojson feature properties
      'fill-color': getColorFromPropertiesWithDefault(defaultColor),
      'fill-opacity': 0.1
    }
  },
  // polygon outline
  {
    'id': 'gl-draw-polygon-stroke-static',
    'type': 'line',
    'filter': ['all', ['==', '$type', 'Polygon'], ['==', 'mode', 'static']],
    'layout': {
      'line-cap': 'round',
      'line-join': 'round'
    },
    'paint': {
      // get color from geojson feature properties
      'line-color': getColorFromPropertiesWithDefault(defaultColor)
    }
  }
]
