// header backdrops

  let backdrop = document.getElementById('header-backdrop');
  let page = backdrop.dataset.page;

  // changing these values along with the css animations can be used to create unique animations 
  // on product page's header sections. These animations get applied to the backdrop svg elements individually.
  // so if the tag name is path then the js grabs all of the path elements in the svg and applies the animation
  // to each path, altering the length of the animation and delay based on the provided offsets
  let config = {
    'liquid':{
      tag_name: 'path',
      animation_name: 'liquid_transform_anim',
      transform_origin: 'center',

      transform_animation_time_base: .3,
      transform_animation_time_offset: .02,
      transform_animation_time_offset_direction: 'backwards',

      transform_animation_delay_time_base: .3,
      transform_animation_delay_time_offset: .02,
      transform_animation_delay_time_offset_direction: 'forwards',
    },
    'green':{
      tag_name: 'polygon',
      animation_name: 'green_transform_anim',
      transform_origin: 'center',

      transform_animation_time_base: .3,
      transform_animation_time_offset: .01,
      transform_animation_time_offset_direction: 'forwards',

      transform_animation_delay_time_base: .4,
      transform_animation_delay_time_offset: .02,
      transform_animation_delay_time_offset_direction: 'forwards',
    },
    'mining':{
      tag_name: 'polygon',
      animation_name: 'mining_transform_anim',
      transform_origin: 'center',

      transform_animation_time_base: .3,
      transform_animation_time_offset: .0,
      transform_animation_time_offset_direction: 'forwards',

      transform_animation_delay_time_base: .4,
      transform_animation_delay_time_offset: .014,
      transform_animation_delay_time_offset_direction: 'forwards',
    },
    'satellite':{
      tag_name: 'path',
      animation_name: 'satellite_transform_anim',
      transform_origin: 'center',

      transform_animation_time_base: .3,
      transform_animation_time_offset: .004,
      transform_animation_time_offset_direction: 'forwards',

      transform_animation_delay_time_base: .3,
      transform_animation_delay_time_offset: .004,
      transform_animation_delay_time_offset_direction: 'backwards',
    },
    'lightning':{
      tag_name: 'polygon',
      animation_name: 'lightning_transform_anim',
      transform_origin: 'center',

      transform_animation_time_base: .3,
      transform_animation_time_offset: .02,
      transform_animation_time_offset_direction: 'backwards',

      transform_animation_delay_time_base: .3,
      transform_animation_delay_time_offset: .02,
      transform_animation_delay_time_offset_direction: 'forwards',
    },
    'elements':{
      tag_name: 'path',
      animation_name: 'elements_transform_anim',
      transform_origin: 'center',

      transform_animation_time_base: .6,
      transform_animation_time_offset: .00,
      transform_animation_time_offset_direction: 'forwards',

      transform_animation_delay_time_base: .4,
      transform_animation_delay_time_offset: .002,
      transform_animation_delay_time_offset_direction: 'forwards',
    },
    'datafeed':{
      tag_name: 'path',
      animation_name: 'datafeed_transform_anim',
      transform_origin: 'center',

      transform_animation_time_base: .4,
      transform_animation_time_offset: .02,
      transform_animation_time_offset_direction: 'backwards',

      transform_animation_delay_time_base: .3,
      transform_animation_delay_time_offset: .03,
      transform_animation_delay_time_offset_direction: 'forwards',
    },
    'jade':{
      tag_name: 'path',
      animation_name: 'jade_transform_anim',
      transform_origin: 'center',

      transform_animation_time_base: .4,
      transform_animation_time_offset: .02,
      transform_animation_time_offset_direction: 'backwards',

      transform_animation_delay_time_base: .3,
      transform_animation_delay_time_offset: .03,
      transform_animation_delay_time_offset_direction: 'forwards',
    },
    'aqua':{
      tag_name: 'path',
      animation_name: 'aqua_transform_anim',
      transform_origin: 'center',

      transform_animation_time_base: .4,
      transform_animation_time_offset: .03,
      transform_animation_time_offset_direction: 'backwards',

      transform_animation_delay_time_base: .4,
      transform_animation_delay_time_offset: .03,
      transform_animation_delay_time_offset_direction: 'backwards',
    },
    'amp':{
      tag_name: 'path',
      animation_name: 'amp_transform_anim',
      transform_origin: 'center',

      transform_animation_time_base: .5,
      transform_animation_time_offset: .02,
      transform_animation_time_offset_direction: 'forwards',

      transform_animation_delay_time_base: .4,
      transform_animation_delay_time_offset: .02,
      transform_animation_delay_time_offset_direction: 'backwards',
    },
  }

  function add_animations(config){
    let elements = backdrop.getElementsByTagName(config.tag_name)
    let count = 0;

    if (config.tag_name != 'g'){
      lengths = [...elements].map(item => item.getTotalLength());
      maxElementLength = Math.max(...lengths);
    }

    animation_name = config.animation_name
    origin = config.transform_origin

    t_base = config.transform_animation_time_base
    t_offset = config.transform_animation_time_offset
    t_direction = config.transform_animation_time_offset_direction

    t_delay_base = config.transform_animation_delay_time_base
    t_delay_offset = config.transform_animation_delay_time_offset
    t_delay_direction = config.transform_animation_delay_time_offset_direction

    for (let element of elements){
      if (config.tag_name != 'g'){
        elementLength = element.getTotalLength()
      }
    
      countBack = elements.length - count - 1

      elements[count].style.transformOrigin = origin;

      t_count = t_direction == 'forwards' ? count : countBack;
      t_delay_count = t_delay_direction == 'forwards' ? count : countBack;

      t_anim_time = t_base + (t_count * t_offset)
      t_anim_delay = t_delay_base + (t_delay_count * t_delay_offset)

      t_anim_str = animation_name + ' ' + t_anim_time + 's ease-out forwards ' + t_anim_delay + 's'
      
      elements[count].style.animation = t_anim_str

      count += 1;
    } 
  }

  add_animations(config[page]);
