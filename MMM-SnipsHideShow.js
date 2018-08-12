'use strict';
/* global Module */

/* Magic Mirror
 * Module: MMM-SnipsHideShow
 *
 * By Max Bachmann
 * MIT Licensed.
 */

Module.register('MMM-SnipsHideShow', {

  defaults: {
    mqttServer: '',
    interval: 300000,
    PAGEONE: ["clock", "MMM-EyeCandy", "compliments", "calendar","newsfeed"],
    PAGETWO: [],
    PAGETHREE: [],
    PAGEFOUR: [],
    PAGEFIVE: [],
    PAGESIX: [],

    moduleNames: {
      "ALL"       : "ALL",
      "PAGEONE"   : "PAGEONE",
      "PAGETWO"   : "PAGETWO",
      "PAGETHREE" : "PAGETHREE",
      "PAGEFOUR"  : "PAGEFOUR",
      "PAGEFIVE"  : "PAGEFIVE",
      "PAGESIX"   : "PAGESIX",
      "CLOCK"     : "clock",
      "CALENDAR"  : "calendar",
      "EYECANDY"  : "MMM-EyeCandy",
      "WEATHER"   : "weatherforecast",
      "NEWS"      : "newsfeed"
    }
  },

  start: function() {
    Log.info('Starting module: ' + this.name);
    this.loaded = false;
    this.updateMqtt(this);
  },

  updateMqtt: function(self) {
    self.sendSocketNotification('MQTT_SERVER', { mqttServer: self.config.mqttServer});
    setTimeout(self.updateMqtt, self.config.interval, self);
  },

  socketNotificationReceived: function(notification, payload) {
    if (notification === 'MQTT_DATA') {
      const topic = 'hermes/external/MagicMirror2/';
      const data = JSON.parse(payload.data.toString());
      const modulename = this.config.moduleNames[data.module.toString()];
      if (payload.topic.toString() === topic + 'MM_Hide'){
        if (modulename === 'ALL'){
          MM.getModules().enumerate((module) => {
            module.hide();
          });
        } else{
          MM.getModules().enumerate((module) => {
            if (module.name === modulename) {
              module.hide();
            }
          });
        }
      } else  if (payload.topic.toString() === topic + 'MM_Show'){
        if (modulename.includes("PAGE")){
          MM.getModules().enumerate((module) => {
            if (this.config[modulename.toString()].indexOf(module) > -1) {
              module.show();
            }else{
              module.hide();
            }
          });
        } else{
          MM.getModules().enumerate((module) => {
            if (module.name === modulename) {
              module.show();
            }
          });
        }
      }else if (payload.topic.toString() === topic + 'MM_Move'){
        const targetRegion = data.position;
        MM.getModules().enumerate((module) => {
          if (module.name === modulename) {
	          const instance = document.getElementById(module.identifier);
	          const region = document.querySelector(`div.region.${targetRegion} div.container`);
            region.insertBefore(instance, region.childNodes[0])
            region.style.display = 'block';
          }
        });
      }
      this.loaded = true;
    }

    if (notification === 'ERROR') {
      this.sendNotification('SHOW_ALERT', payload);
    }
  },
});