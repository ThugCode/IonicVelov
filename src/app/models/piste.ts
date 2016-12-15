import { Geometry } from "./geometry";

export class PisteShape {
    type: string;
    properties: Piste;
    geometry: Geometry;
}

export class Piste {
    nom: string;
    commune1: string;
    commune2: string;
    reseau: string;
    typeamenagement: string;
    typeamenagement2: string;
    positionnement: string;
    senscirculation: string;
    environnement: string;
    localisation: string;
    typologiepiste: string;
    revetementpiste: string;
    domanialite: string;
    reglementation: string;
    anneelivraison: string;
    identifiant: string;
    gid: string;
}