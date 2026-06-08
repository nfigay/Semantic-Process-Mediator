import { w2layout } from 'w2ui';

export function initLayout() {
  const layout = new w2layout({
    box: '#app',
    name: 'mainLayout',
    panels: [
      { type: 'top', size: 40, resizable: false, html: '<div id="menu-container"></div>' },
      { type: 'left', size: 300, resizable: true, minSize: 200, html: '<div id="tree-container" style="height:100%"></div>' },
      { type: 'main', html: '<div id="bpmn-container" class="bpmn-container"></div>' },
      { type: 'bottom', size: 250, resizable: true, html: '<div id="properties-container" class="properties-panel-container"></div>' }
    ]
  });

  return layout;
}