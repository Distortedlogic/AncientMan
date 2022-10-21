import { GameObjects, Physics } from "phaser";

export class TypedSpriteGroup<TSprite extends GameObjects.GameObject = GameObjects.GameObject> extends Physics.Arcade.Group {
  getChildren() {
    return super.getChildren() as TSprite[];
  }

  getMatching(property?: string | undefined, value?: any, startIndex?: number | undefined, endIndex?: number | undefined) {
    return super.getMatching(property, value, startIndex, endIndex) as TSprite[];
  }
}
