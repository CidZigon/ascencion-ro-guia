export type EquipSlot = {
  id: string;
  location: string;
  icon: string;
  title: string;
  description: string;
};

export type WeaponKind = {
  id: string;
  subType: string;
  icon: string;
  title: string;
  description: string;
};

export const EQUIP_SLOTS: EquipSlot[] = [
  { id: "casco-superior", location: "Head_Top", icon: "⛑", title: "Casco (superior)", description: "Gorros, cintas, cascos y velos. Incluye los que ocupan varias ranuras de cabeza." },
  { id: "casco-medio", location: "Head_Mid", icon: "👓", title: "Casco (medio)", description: "Gafas, lentes y parches. Incluye los que también cubren otras partes de la cabeza." },
  { id: "casco-inferior", location: "Head_Low", icon: "😷", title: "Casco (inferior)", description: "Mascarillas, barbas y accesorios de boca. Incluye los que van en las tres ranuras." },
  { id: "armadura", location: "Armor", icon: "🛡", title: "Armadura", description: "Camisas, chaquetas y armaduras de pecho." },
  { id: "capa", location: "Garment", icon: "🧥", title: "Capa", description: "Hood, muffler, manteau y demás prendas." },
  { id: "zapatos", location: "Shoes", icon: "👟", title: "Zapatos", description: "Sandalias, zapatos y botas." },
  { id: "accesorios", location: "Both_Accessory", icon: "💍", title: "Accesorios", description: "Anillos, aretes, collares, guantes y clips." },
  { id: "escudo", location: "Left_Hand", icon: "⛨", title: "Escudo", description: "Guard, buckler, shield y protecciones de mano izquierda." },
];

export const WEAPON_KINDS: WeaponKind[] = [
  { id: "1h-sword", subType: "1hSword", icon: "⚔", title: "Espada de una mano", description: "One-handed swords" },
  { id: "2h-sword", subType: "2hSword", icon: "⚔", title: "Espada de dos manos", description: "Two-handed swords" },
  { id: "dagger", subType: "Dagger", icon: "🗡", title: "Daga", description: "Daggers" },
  { id: "katar", subType: "Katar", icon: "⚔", title: "Katar", description: "Katars" },
  { id: "1h-axe", subType: "1hAxe", icon: "🪓", title: "Hacha de una mano", description: "One-handed axes" },
  { id: "2h-axe", subType: "2hAxe", icon: "🪓", title: "Hacha de dos manos", description: "Two-handed axes" },
  { id: "1h-spear", subType: "1hSpear", icon: "🔱", title: "Lanza de una mano", description: "One-handed spears" },
  { id: "2h-spear", subType: "2hSpear", icon: "🔱", title: "Lanza de dos manos", description: "Two-handed spears" },
  { id: "staff", subType: "Staff", icon: "🪄", title: "Báculo", description: "Staves" },
  { id: "2h-staff", subType: "2hStaff", icon: "🪄", title: "Báculo de dos manos", description: "Two-handed staves" },
  { id: "mace", subType: "Mace", icon: "🔨", title: "Maza", description: "Maces" },
  { id: "book", subType: "Book", icon: "📖", title: "Libro", description: "Books" },
  { id: "bow", subType: "Bow", icon: "🏹", title: "Arco", description: "Bows" },
  { id: "knuckle", subType: "Knuckle", icon: "✊", title: "Nudillos", description: "Knuckles" },
  { id: "musical", subType: "Musical", icon: "🎵", title: "Instrumento", description: "Musical instruments" },
  { id: "whip", subType: "Whip", icon: "〰", title: "Látigo", description: "Whips" },
  { id: "revolver", subType: "Revolver", icon: "🔫", title: "Revólver", description: "Revolvers" },
  { id: "rifle", subType: "Rifle", icon: "🔫", title: "Rifle", description: "Rifles" },
  { id: "shotgun", subType: "Shotgun", icon: "🔫", title: "Escopeta", description: "Shotguns" },
  { id: "gatling", subType: "Gatling", icon: "🔫", title: "Gatling", description: "Gatling guns" },
  { id: "grenade", subType: "Grenade", icon: "💣", title: "Lanzagranadas", description: "Grenade launchers" },
  { id: "huuma", subType: "Huuma", icon: "✴", title: "Huuma", description: "Huuma shuriken" },
];

export function equipSlotById(id: string) {
  return EQUIP_SLOTS.find(slot => slot.id === id);
}

export function weaponKindById(id: string) {
  return WEAPON_KINDS.find(kind => kind.id === id);
}

export const EQUIP_HASH = new RegExp(`^#equipo-(${EQUIP_SLOTS.map(slot => slot.id).join("|")})(?:-objeto-(\\d+))?$`);
export const WEAPON_HASH = new RegExp(`^#arma-(${WEAPON_KINDS.map(kind => kind.id).join("|")})(?:-objeto-(\\d+))?$`);
