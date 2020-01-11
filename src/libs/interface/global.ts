import Starter from "../starter";
import { literalImageSrc, UniVector } from "../types/global";
import Resources from "../class/resources";
import SpriteTextureComponent from "../class/visual-methods/sprite-animation";
import TextureComponent from "../class/visual-methods/texture";

export interface ICollisionFilter { category: number; group: number; mask: number; }

export interface IUniVector { [key: string]: any; }

export interface ISelectedPlayer {
  labelName: string;
  resource: Resources;
  type:string;
  texCom: null | SpriteTextureComponent | TextureComponent;
  playerDie: Resources,
  playerDieType: string,
  texDie: null| SpriteTextureComponent | TextureComponent;
}

export interface IStaticItem {
  x: number; y: number; w: number; h: number;
  tex: literalImageSrc;
  tiles: { tilesX: number, tilesY: number};
  collisionFilter?: ICollisionFilter;
}
export interface IStaticLabel {
  x: number; y: number; w: number; h: number;
  text: string; options: { color: string};
}

export interface ICollectionItem extends IStaticItem {
  colectionLabel: string;
  points: number;
}

export interface IBotBehaviorOptions {
  patrolType: string;
  patrolPeriod: number;
  patrolLoop: boolean;
}

// Remove any at the end
export interface ICollectionEnemies extends IStaticItem {
  enemyLabel: string;
  enemyOptions: IBotBehaviorOptions | any;
}

export interface ISpriteShema {
  byX: number;
  byY: number;
}

export interface IUserRegData {
  email: string;
  password: string;
}

export interface IConnectorMsg {
  action: string;
  data: UniVector;
 }

export interface IMessageReceived {
  action: string;
  data: any;
}

export interface IGamePlayModel {
   gameName: string;
   version: number;
   starter: Starter;
   player: any;
}

export interface IGamePlayPlatformerMap {
  getStaticGrounds(): IStaticItem[];
  getStaticBackgrounds(): IStaticItem[];
  getCollectItems(): ICollectionItem[];
  getEnemys(): ICollectionEnemies[];
}

export interface IPoint {
  x: number;
  y: number;
}

export interface IMultiplayer {
  multiPlayerRef: any;
  netBodies: any;
}
