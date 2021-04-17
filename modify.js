const geojsonArea = require('@mapbox/geojson-area')

const preProcess = (f) => {
  f.tippecanoe = {
    layer: 'other',
    minzoom: 5,
    maxzoom: 5
  }
  // name
  if (
    f.properties.hasOwnProperty('en_name') ||
    f.properties.hasOwnProperty('int_name') ||
    f.properties.hasOwnProperty('name') ||
    f.properties.hasOwnProperty('ar_name')
  ) {
    let name = ''
    if (f.properties['en_name']) {
      name = f.properties['en_name']
    } else if (f.properties['int_name']) {
      name = f.properties['int_name']
    } else if (f.properties['name']) {
      name = f.properties['name']
    } else {
      name = f.properties['ar_name']
    }
    delete f.properties['en_name']
    delete f.properties['ar_name']
    delete f.properties['int_name']
    delete f.properties['name']
    f.properties.name = name
  }
  return f
}

const postProcess = (f) => {
  delete f.properties['_database']
  delete f.properties['_table']
  return f
}

const flap = (f, defaultZ) => {
  switch (f.geometry.type) {
    case 'MultiPolygon':
    case 'Polygon':
      let mz = Math.floor(
        19 - Math.log2(geojsonArea.geometry(f.geometry)) / 2
      )
      if (mz > 15) { mz = 15 }
      if (mz < 6) { mz = 6 }
      return mz
    default:
      return defaultZ ? defaultZ : 10
  }
}

const minzoomRoad = (f) => {
  switch (f.properties.fclass) {
    case 'path':
    case 'pedestrian':
    case 'footway':
    case 'cycleway':
    case 'living_street':
    case 'steps':
    case 'bridleway':
      return 13
    case 'residential':
    case 'service':
    case 'track':
    case 'unclassified':
      return 11
    case 'road':
    case 'tertiary_link':
      return 10
    case 'tertiary':
    case 'secondary_link':
      return 9
    case 'secondary':
    case 'primary_link':
      return 8
    case 'primary':
    case 'trunk_link':
    case 'motorway_link':
      return 7
    case 'motorway':
    case 'trunk':
      return 6
    default:
      return 15
  }
}

const minzoomWater = (f) => {
  if (f.properties.fclass === 'water') {
    return 6
  } else if (f.properties.fclass === 'lake') {
    return 6
  } else if (f.properties.fclass === 'pond') {
    return 6
  } else if (f.properties.fclass === 'glacier') {
    return 6
  } else if (f.properties.fclass === 'riverbank') {
    return 7
  } else if (f.properties.fclass === 'wetland') {
    return 8
  } else if (f.properties.fclass === 'basin') {
    return 9
  } else if (f.properties.fclass === 'reservoir') {
    return 9
  } else {
    throw new Error(`monzoomWater: ${f.properties}`)
  }
}

const lut = {
  landuse_naturalmedium0609_a: f => {
    let lc_arr = [20, 30, 80]
    if (!lc_arr.includes(f.properties.gridcode)) return null
    f.tippecanoe = {
      layer: 'nature-s',
      minzoom: 5,
      maxzoom: 5
    }
    return f
  },
  roads_major_0408_l: f => {
    let rd_arr = [1, 3, 5, 7]
    if (!rd_arr.includes(f.properties.z_order)) return null
    f.tippecanoe = {
      layer: 'road-s',
      minzoom: 3,
      maxzoom: 5
    }
    return f
  },
  unhq_bndl: f => {
    f.tippecanoe = {
      layer: 'bndl',
      minzoom: 5,
      maxzoom: 5
    }
    return f
  },
  unhq_bndl05: f => {
    f.tippecanoe = {
      layer: 'bndl',
      minzoom: 3,
      maxzoom: 4
    }
    return f
  },
   unhq_bndl25: f => {
    f.tippecanoe = {
      layer: 'bndl',
      minzoom: 0,
      maxzoom: 2
    }
    return f
  },
  custom_planet_land_a_l08: f => {
    if (f.properties.geom === null) return null
    f.tippecanoe = {
      layer: 'landmass',
      minzoom: 0,
      maxzoom: 5
    }
    return f
  },
  un_glc30_global_lc_ss: f => {
    f.tippecanoe = {
      layer: 'landcover',
      minzoom: 3,
      maxzoom: 5
    }
    delete f.properties['id']
    return f
  },
  custom_ne_rivers_lakecentrelines: f => {
    f.tippecanoe = {
      layer: 'un_water',
      minzoom: 0,
      maxzoom: 4
    }
    return f
  },
  unhq_bnda_cty_anno_l03: f => {
    f.tippecanoe = {
      layer: 'lab_cty',
      minzoom: 1,
      maxzoom: 1
    }
    return f
  },
  unhq_bnda_cty_anno_l04: f => {
    f.tippecanoe = {
      layer: 'lab_cty',
      minzoom: 2,
      maxzoom: 2
    }
    return f
  },
  unhq_bnda_cty_anno_l05: f => {
    f.tippecanoe = {
      layer: 'lab_cty',
      minzoom: 3,
      maxzoom: 3
    }
    return f
  },
  unhq_bnda_cty_anno_l06: f => {
    f.tippecanoe = {
      layer: 'lab_cty',
      minzoom: 4,
      maxzoom: 4
    }
    return f
  },
  unhq_cm02_phyp_anno_l04: f => {
    f.tippecanoe = {
      layer: 'lab_water_m',
      minzoom: 1,
      maxzoom: 3
    }
    return f
  },
  unhq_cm02_phyp_anno_l06: f => {
    f.tippecanoe = {
      layer: 'lab_water_m',
      minzoom: 4,
      maxzoom: 5
    }
    return f
  },
  unhq_popp: f => {
    let popp_arr = [1, 2, 3]
    if (!popp_arr.includes(f.properties.poptyp_code)) return null
    if (f.properties.poptyp_code !== 3 || f.properties.scl_id_code !== 10) return null
    f.tippecanoe = {
      layer: 'un_popp',
      minzoom: 3,
      maxzoom: 5
    }
    return f
  }
}
module.exports = (f) => {
  return postProcess(lut[f.properties._table](preProcess(f)))
}