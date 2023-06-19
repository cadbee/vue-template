<script setup>
import {onMounted, ref} from 'vue';
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
onMounted(() => {
  // Remove default controls
  map.value.map.getControls().clear();

  const drawingVector = new SourceVector({
    features: [],
    wrapX: false,
  });
  const drawingLayer = new VectorLayer({
    title: 'Custom Drawings',
    source: drawingVector,
  });
  let vectorToSave = drawingVector;
  map.value.map.addLayer(drawingLayer);
  console.log(map.value.map.getLayers());
  const saveGeoJSONControl = new Button({
    html: '<i class="mdi-download mdi v-icon notranslate v-theme--light v-icon--size-small" aria-hidden="true" style="cursor: pointer"></i>',
    title: 'Save as GeoJSON',
    handleClick: () => {
      const geoJson = new GeoJSON().writeFeatures(vectorToSave.getFeatures());
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

  let editBar = new EditBar({
    source: drawingVector,
    interactions: {
      Info: false,
    },
  });
  const toggleMove = new Toggle({
    active: true,
    html: '<i class="mdi-cursor-move mdi v-icon notranslate v-theme--light v-icon--size-small" aria-hidden="true" style="cursor: pointer;"></i>',
  });
  editBar.addControl(toggleMove);
  editBar.setPosition('top');
  map.value.map.addControl(editBar);

  const layerSwitchImageControl = new LayerSwitcherImage();
  layerSwitchImageControl.on('layer:visible', (event) => {
    const {layer} = event;
    if (layer instanceof VectorLayer) {
      const editBarOptions = {
        source: undefined,
        interactions: {
          Info: false,
        },
      };
      map.value.map.removeControl(editBar);
      if (layer.getVisible()) {
        editBarOptions.source = layer.getSource();
      } else {
        const visibleVectorLayer = map.value.map.getAllLayers().find((item) => (item instanceof VectorLayer) && item.getVisible());
        if (visibleVectorLayer !== undefined) {
          editBarOptions.source = visibleVectorLayer.getSource();
        }
      }
      if (editBarOptions.source !== undefined) {
        editBar = new EditBar(editBarOptions);
        editBar.addControl(toggleMove);
        map.value.map.addControl(editBar);
      }
      vectorToSave = editBarOptions.source;
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
    map.value.map.addLayer(new VectorLayer({
      title: 'Imported',
      source: new SourceVector({
        features: new GeoJSON().readFeatures(geojson),
      }),
    }));
  };
  reader.readAsText(geoJsonFile);
};
</script>

<template>
  <v-container class="fill-height">
    <ol-map
      ref="map"
      :loadTilesWhileAnimating="true"
      :loadTilesWhileInteracting="true"
      style="height: 100%; width: 100%"
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
        <ol-source-bingmaps :apiKey="bingMapsKey" :imagerySet="layer.imagerySet" />
      </ol-tile-layer>
    </ol-map>
  </v-container>
  <input
    style="display: none"
    ref="uploadGeoJSONInput"
    type="file"
    @change="uploadGeoJSON"
  />
</template>

<style scoped>

</style>
