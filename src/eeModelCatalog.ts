export type EeCatalogMakerId = 'onrobot' | 'schunk';

export interface EeCatalogEntry {
  id: string;
  name: string;
  fileName: string;
  mass: string;
  type: string;
}

export const EE_CATALOG: Record<EeCatalogMakerId, EeCatalogEntry[]> = {
  onrobot: [
    { id: 'or-2fg7', name: '2FG7', fileName: '2FG7.stl', mass: '0.9', type: 'Gripper' },
    { id: 'or-2fgp20', name: '2FGP20', fileName: '2FGP20.stl', mass: '1.1', type: 'Gripper' },
    { id: 'or-3fg15', name: '3FG15', fileName: '3FG15.stl', mass: '1.3', type: 'Gripper' },
    { id: 'or-gecko', name: 'Gecko', fileName: 'Gecko.stl', mass: '0.5', type: 'Gripper' },
    { id: 'or-rg6', name: 'RG6', fileName: 'RG6.stl', mass: '1.0', type: 'Gripper' },
    { id: 'or-vgc10', name: 'VGC10', fileName: 'VGC10.stl', mass: '1.4', type: 'Gripper' },
    { id: 'or-vgp20', name: 'VGP20', fileName: 'VGP20.stl', mass: '2.2', type: 'Gripper' },
  ],
  schunk: [
    { id: 'sh-egp64', name: 'EGP 64', fileName: 'EGP64.stl', mass: '2.5', type: 'Gripper' },
    { id: 'sh-egp40', name: 'EGP 40', fileName: 'EGP40.stl', mass: '1.8', type: 'Gripper' },
    { id: 'sh-pgn-plus-p', name: 'PGN-plus-P', fileName: 'PGN-plus-P.stl', mass: '3.2', type: 'Gripper' },
    { id: 'sh-jgp-p', name: 'JGP-P', fileName: 'JGP-P.stl', mass: '2.1', type: 'Gripper' },
    { id: 'sh-egi', name: 'EGI', fileName: 'EGI.stl', mass: '2.8', type: 'Gripper' },
    { id: 'sh-pzn-plus', name: 'PZN-plus', fileName: 'PZN-plus.stl', mass: '1.6', type: 'Gripper' },
  ],
};

export const EE_MAKER_LABEL: Record<EeCatalogMakerId, string> = {
  onrobot: 'OnRobot',
  schunk: 'Schunk',
};
