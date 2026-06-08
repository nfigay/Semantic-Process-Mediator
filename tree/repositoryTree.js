import { w2sidebar } from 'w2ui';

export function initRepositoryTree(onNodeSelect) {
  const sidebar = new w2sidebar({
    box: '#tree-container',
    name: 'repositoryTree',
    nodes: [
      { id: 'ci-1', text: 'CI - Logistique & Supply Chain', expanded: true, group: true, nodes: [
          { id: 'proc-1', text: 'Processus Commande Client', icon: 'w2ui-icon-pencil' },
          { id: 'collab-1', text: 'Collaboration Transporteurs', icon: 'w2ui-icon-features' },
          { id: 'data-1', text: 'Extensions & Données partagées', icon: 'w2ui-icon-info' }
        ]
      }
    ],
    onClick(event) {
      // Propagation de l'événement au gestionnaire BPMN lorsqu'un fichier est cliqué
      if (onNodeSelect) {
        onNodeSelect(event.target);
      }
    }
  });

  return sidebar;
}