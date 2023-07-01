<template>
  <ol-map
    ref="map"
    :loadTilesWhileAnimating="true"
    :loadTilesWhileInteracting="true"
    class="h-100 w-100"
  >
    <ol-view
      ref="view"
      :rotation="rotation"
      :projection="projection"
    />

    <ol-tile-layer
      v-for="layer in bingMapsLayers"
      :base-layer="true"
      :title="layer.imagerySet"
      :visible="layer.isVisible"
      :key="layer.imagerySet"
    >
      <ol-source-bingmaps :apiKey="bingMapsKey" :imagerySet="layer.imagerySet" culture="ru"/>
    </ol-tile-layer>
  </ol-map>
  <input
    style="display: none"
    ref="uploadGeoJSONInput"
    type="file"
    @change="uploadGeoJSON"
  />
</template>

<script setup>
import {
  onMounted, ref, watchEffect, computed,
} from 'vue';
import {useStore} from 'vuex';
import {useMutation, useQuery} from '@vue/apollo-composable';

import LayerSwitcherImage from 'ol-ext/control/LayerSwitcherImage';
import Bar from 'ol-ext/control/Bar';
import EditBar from 'ol-ext/control/EditBar';
import GeolocationButton from 'ol-ext/control/GeolocationButton';
import Toggle from 'ol-ext/control/Toggle';
import Button from 'ol-ext/control/Button';

import {FullScreen, Rotate, Zoom} from 'ol/control';
import {Vector as VectorLayer} from 'ol/layer';
import {Vector as SourceVector} from 'ol/source';
import {GeoJSON} from 'ol/format';
import {
  Fill,
  Icon, Stroke, Style, Circle,
} from 'ol/style';
import cspline from 'ol-ext/render/Cspline';

const projection = ref('EPSG:3857');
const rotation = ref(0);
const map = ref(null);
const view = ref(null);
const uploadGeoJSONInput = ref(null);
const bingMapsKey = 'AmVsq9RuMAPsJd1ASWEyfQEU5izCXRwGG1vaIw5eZ_nKoiCxZqN9PPZYoYYsFGQS';
const bingMapsLayers = [
  {
    isVisible: true,
    imagerySet: 'RoadOnDemand',
  },
  {
    isVisible: false,
    imagerySet: 'Aerial',
  },
  {
    isVisible: false,
    imagerySet: 'AerialWithLabelsOnDemand',
  },
  {
    isVisible: false,
    imagerySet: 'CanvasDark',
  },
  {
    isVisible: false,
    imagerySet: 'CanvasLight',
  },
  {
    isVisible: false,
    imagerySet: 'CanvasGray',
  },
];

const layersQuery = require('@/graphql/queries/Layers.gql');

const store = useStore();
const activeSignType = computed(() => store.state.signs.activeSignType);
const activeTroopId = computed(() => store.state.troops.activeTroopId);
const mode = computed(() => store.state.signs.mode);

const featureStyles = {
  DrawPoint: new Style({
    image: new Icon({
      src: './signs/flag-variant-outline.svg',
      opacity: 1,
      scale: 2,
    }),
  }),
  DrawLine: (f) => new Style({
    geometry: f.getGeometry().cspline({
      normalize: true,
    }),
    stroke: new Stroke({
      color: 'red',
      width: 4,
    }),
    image: new Circle({
      radius: 5,
      fill: new Fill({
        color: 'red',
      }),
    }),
  }),
  DrawPolygon: (f) => new Style({
    geometry: f.getGeometry().cspline(),
    stroke: new Stroke({
      color: 'green',
      width: 4,
    }),
    image: new Circle({
      radius: 5,
      fill: new Fill({
        color: 'green',
      }),
    }),
  }),
  DrawRegular: new Style({
    stroke: new Stroke({
      color: 'blue',
      width: 4,
    }),
    image: new Circle({
      radius: 5,
      fill: new Fill({
        color: 'blue',
      }),
    }),
  }),
};

const {mutate: changeLayerVisibleMutation} = useMutation(require('@/graphql/mutations/LayerVisibleChange.gql'), {
  update(cache, {data: {changeLayerVisibility}}) {
    cache.modify({
      fields: {
        layers(existingLayers = []) {
          const newLayers = cache.readQuery({query: layersQuery}).layers;
          store.commit('layers/setLayers', newLayers);
          return [...existingLayers];
        },
      },
    });
  },
  onQueryUpdated(observableQuery) {
    return false;
  },
});

const {mutate: updateLayerContentMutation} = useMutation(require('@/graphql/mutations/UpdateLayerContent.gql'), {
  update(cache, {data: {updateLayer}}) {
    cache.modify({
      fields: {
        layers(existingLayers = []) {
          const newLayers = cache.readQuery({query: layersQuery}).layers;
          store.commit('layers/setLayers', newLayers);
          return [...existingLayers];
        },
      },
    });
  },
  onQueryUpdated(observableQuery) {
    return false;
  },
});

const resetStyles = () => {
  if (map.value) {
    const mapLayers = map.value.map.getAllLayers();
    mapLayers.forEach((layer) => {
      if (layer instanceof VectorLayer) {
        const layerFeatures = layer.getSource().getFeatures();
        layerFeatures.forEach((feature) => {
          feature.setStyle(featureStyles[feature.getProperties().type]);
        });
      }
    });
  }
};

const saveLayers = () => {
  const {current} = store.state.layers;
  if (map.value) {
    const currentLayer = map.value.map.getAllLayers().find((el) => el.get('id') === current);
    if (currentLayer instanceof VectorLayer) {
      const sourceVector = currentLayer.getSource();
      const vectorFeatures = sourceVector.getFeatures();
      const geoJson = new GeoJSON().writeFeatures(vectorFeatures);
      updateLayerContentMutation({
        input: {
          id: currentLayer.get('id'),
          content: JSON.stringify(geoJson),
        },
      });
    }
  }
};

watchEffect(() => {
  const {visibleLayers} = store.state.layers;
  if (map.value) {
    map.value.map.getAllLayers().forEach((layer) => {
      if (visibleLayers.includes(layer.get('id'))) {
        layer.setVisible(true);
      } else if (layer instanceof VectorLayer) {
        layer.setVisible(false);
      }
    });
  }
});

let editBar = null;
const toggleMove = new Toggle({
  html: '<i class="mdi-cursor-move mdi v-icon notranslate v-theme--light v-icon--size-small" aria-hidden="true" style="cursor: pointer;"></i>',
});

watchEffect(() => {
  const {current} = store.state.layers;
  if (map.value) {
    const currentLayer = map.value.map.getAllLayers().find((el) => el.get('id') === current);
    if (editBar) {
      map.value.map.removeControl(editBar);
      editBar = null;
    }
    if (currentLayer instanceof VectorLayer) {
      const editBarOptions = {
        source: currentLayer.getSource(),
        interactions: {
          Info: false,
        },
      };
      editBar = new EditBar(editBarOptions);
      toggleMove.setActive(true);
      editBar.addControl(toggleMove);
      map.value.map.addControl(editBar);
    }
  }
});

watchEffect(() => {
  resetStyles();
  if (activeSignType.value && activeTroopId.value && mode.value === 'Draw') {
    if (editBar) {
      const interaction = editBar.getInteraction(activeSignType.value);
      if (interaction) {
        if (interaction.getOverlay) {
          interaction.on('change:active', () => {
            interaction?.getOverlay()?.setStyle(featureStyles[activeSignType.value]);
          });
        }
        interaction.setActive(true);
        interaction.on('drawstart', (event) => {
          const {feature} = event;
          feature.setStyle(featureStyles[activeSignType.value]);
          feature.setProperties({troopId: activeTroopId.value, type: activeSignType.value});
        });
      }
    }
  } else if (mode.value === 'Search' && map.value) {
    toggleMove.setActive(true);
    const mapLayers = map.value.map.getAllLayers();
    const highlightStyle = new Style({
      stroke: new Stroke({
        color: 'yellow',
        width: 6,
      }),
      image: new Circle({
        radius: 5,
        fill: new Fill({
          color: 'yellow',
        }),
      }),
    });
    mapLayers.forEach((layer) => {
      if (layer instanceof VectorLayer) {
        const layerFeatures = layer.getSource().getFeatures();
        layerFeatures.forEach((feature) => {
          const featureProperties = feature.getProperties();
          if (activeSignType.value && activeTroopId.value) {
            if (featureProperties.type === activeSignType.value && featureProperties.troopId === activeTroopId.value) {
              feature.setStyle(highlightStyle);
            }
          } else if (activeSignType.value && featureProperties.type === activeSignType.value) {
            feature.setStyle(highlightStyle);
          } else if (activeTroopId.value && featureProperties.troopId === activeTroopId.value) {
            feature.setStyle(highlightStyle);
          }
        });
      }
    });
  }
});

onMounted(() => {
  // Remove default controls
  map.value.map.getControls().clear();

  const {onResult} = useQuery(layersQuery);

  onResult((queryResult) => {
    store.commit('layers/setLoading', queryResult.loading);
    console.log('Query updating');
    if (queryResult?.data?.layers) {
      store.commit('layers/setLayers', queryResult.data.layers);
      const {layers} = store.state.layers;
      for (const layer of layers) {
        const mapLayersIds = map.value.map.getAllLayers().map((el) => el.get('id'));
        if (!mapLayersIds.includes(layer.id)) {
          let geojson;
          let newVector;
          try {
            geojson = JSON.parse(layer.content);
            newVector = new SourceVector({
              features: new GeoJSON().readFeatures(geojson),
            });
          } catch (e) {
            newVector = new SourceVector();
          }
          const newLayer = new VectorLayer({
            title: layer.title,
            visible: layer.visible,
          });
          if (layer.current) {
            store.commit('layers/setCurrentLayer', layer.id);
          }
          newLayer.set('id', layer.id);
          newLayer.setVisible(layer.visible);
          newLayer.setSource(newVector);
          newLayer.getSource().forEachFeature((feature) => {
            const featureProperties = feature.getProperties();
            if ('type' in featureProperties) {
              feature.setStyle(featureStyles[featureProperties.type]);
            }
          });
          newVector.on('addfeature', () => {
            console.log('Feature added');
            saveLayers();
          });
          newVector.on('removefeature', () => {
            console.log('Feature removed');
            saveLayers();
          });
          map.value.map.addLayer(newLayer);
        }
      }
    }
  });

  const saveGeoJSONControl = new Button({
    html: '<i class="mdi-download mdi v-icon notranslate v-theme--light v-icon--size-small" aria-hidden="true" style="cursor: pointer"></i>',
    title: 'Save as GeoJSON',
    handleClick: () => {
      const layerToSave = map.value.map.getLayers().getArray().find((el) => el.get('id') === store.state.layers.current);
      const vectorFeatures = layerToSave.getSource().getFeatures();
      const features = [];
      vectorFeatures.forEach((feature) => {
        features.push(feature);
      });
      const geoJson = new GeoJSON().writeFeatures(features);
      const a = document.createElement('a');
      const file = new Blob([JSON.stringify(geoJson)], {type: 'application/json'});
      a.href = URL.createObjectURL(file);
      a.download = 'GeoJSON_Example.json';
      a.click();
      a.remove();
    },
  });
  const importGeoJSONControl = new Button({
    html: '<i class="mdi-import mdi v-icon notranslate v-theme--light v-icon--size-small" aria-hidden="true" style="cursor: pointer"></i>',
    title: 'Import from GeoJSON',
    handleClick: () => {
      uploadGeoJSONInput.value.click();
    },
  });

  const barControl = new Bar({
    controls: [
      new FullScreen(),
      new Zoom(),
      new Rotate(),
      new GeolocationButton({delay: 10000}),
      saveGeoJSONControl,
      importGeoJSONControl,
    ],
  });
  barControl.setPosition('top-left');
  map.value.map.addControl(barControl);

  const layerSwitchImageControl = new LayerSwitcherImage();
  layerSwitchImageControl.on('layer:visible', (event) => {
    const {layer} = event;
    if (layer instanceof VectorLayer) {
      const storeLayer = store.state.layers.layers.find((el) => el.id === layer.get('id'));
      if (storeLayer && storeLayer.visible !== layer.getVisible()) {
        changeLayerVisibleMutation({id: storeLayer.id});
      }
    }
  });
  map.value.map.on('loadend', () => {
    // Sources need to become 'ready' before the tiles can be accessed and layer.getPreview working
    map.value.map.addControl(layerSwitchImageControl);
  });
});

const uploadGeoJSON = (event) => {
  const geoJsonFile = event.target.files[0];
  const reader = new FileReader();
  reader.onload = (res) => {
    const geojson = JSON.parse(res.target.result);
    const newVectorLayer = new VectorLayer({
      title: 'Imported',
      source: new SourceVector({
        features: new GeoJSON().readFeatures(geojson),
      }),
    });
    newVectorLayer.getSource().forEachFeature((feature) => {
      const featureProperties = feature.getProperties();
      if ('type' in featureProperties) {
        feature.setStyle(featureStyles[featureProperties.type]);
      }
    });
    map.value.map.addLayer(newVectorLayer);
  };
  reader.readAsText(geoJsonFile);
};
</script>

<style>

</style>
