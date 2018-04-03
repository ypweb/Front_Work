<template>
  <div class="screen-item screen-scene" id="screen_scene">
    <div>
      <h3 class="theme g-c-white">场景展示</h3>
      <ul class="scene-itemwrap scene-itempc" id="screen_3d">
        <li class="scene-item1">
          <div class="scene-item">
            <div class="scene-itemfront"><img src="static/images/screen_scene1.jpg" alt="" /></div>
            <div class="scene-itemback"><img src="static/images/screen_scene2.jpg" alt="" /></div>
          </div>
        </li>
        <li class="scene-item2">
          <div class="scene-item">
            <div class="scene-itemfront"><img src="static/images/screen_scene2.jpg" alt="" /></div>
            <div class="scene-itemback"><img src="static/images/screen_scene3.jpg" alt="" /></div>
          </div>
        </li>
        <li class="scene-item3">
          <div class="scene-item">
            <div class="scene-itemfront"><img src="static/images/screen_scene3.jpg" alt="" /></div>
            <div class="scene-itemback"><img src="static/images/screen_scene1.jpg" alt="" /></div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'cc_scene'
  }
</script>
