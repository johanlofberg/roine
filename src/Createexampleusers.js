import { uniqueID, createDefaultRaceClasses, normalizeRacers } from './myUtilities';

export default function Createexampleusers() {

    const classes = createDefaultRaceClasses()
    const n = classes.length
    // Soft id properties
    const index = 1
    const jens = { name: "Jens Lindgren", number: 345, next: 0, lapmarkings: [], id: uniqueID(), class: classes[index % n].name, club: 'GMK' };
    const thomas = { name: "Thomas Larsen", number: 4, next: 0, lapmarkings: [], id: uniqueID(), class: classes[index % n].name, club: 'GMK' };
    const johan = { name: "Johan Löfberg", number: 11, next: 0, lapmarkings: [], id: uniqueID(), class: classes[index % n].name, club: 'GMK' };
    const stefan = { name: "Stefan Johansson", number: 78, next: 0, lapmarkings: [], id: uniqueID(), class: classes[index % n].name, club: 'GMK' };
    const hasse = { name: "Hasse Johansson", number: 1, next: 0, lapmarkings: [], id: uniqueID(), class: classes[index % n].name, club: 'GMK' };
    const bosse = { name: "Bosse Johansson", number: 666, next: 0, lapmarkings: [], id: uniqueID(), class: classes[index % n].name, club: 'GMK' };
    const sofia = { name: "Sofia Johansson", number: 18, next: 0, lapmarkings: [], id: uniqueID(), class: classes[index % n].name, club: 'GMK' };
    const malin = {
        name: "Malin Johansson",
        number: 31,
        //next: 0,
//        lapmarkings: [],
        id: uniqueID(),
        class: classes[index % n].name,
        club: 'GMK',
    //    dns: false,
    //    dnf: false,
    //    finished: false,
    };
    const ahmed = { 
        name: "Ahmed Johansson", 
        number: 10, 
      //  next: 0, 
        //lapmarkings: [], 
        id: uniqueID(), 
        class: classes[index % n].name, 
        club: 'GMK', 
      //  dns: false,
//        dnf: false,
  //      finished: false,
    };
    const malkimin = { name: "Malkimin Johansson", number: 43, next: 0, lapmarkings: [], id: uniqueID(), class: classes[index % n].name, club: 'GMK' };
    const mats = { name: "Mats Stegemyr-Bengtsson", number: 21, next: 0, lapmarkings: [], id: uniqueID(), class: classes[index % n].name, club: 'GMK' };
    const joakim = { name: "Joakim Ljunggren", number: 10, next: 0, lapmarkings: [], id: uniqueID(), class: classes[index % n].name, club: 'GMK' };
    const martin = { name: "Martin Al", number: 43, next: 0, lapmarkings: [], id: uniqueID(), class: classes[index % n].name, club: 'GMK' };

    //let localracers = [malin, sofia, jens, thomas, johan, stefan, hasse, bosse, ahmed, malkimin, mats, joakim, martin]
    let localracers = [malin,ahmed]

    //localracers = localracers.map((racer) => (normalizeRacer(racer)))
    localracers = normalizeRacers(localracers)//.map((racer) => (normalizeRacer(racer)))

    // Add more structural properties

    //localracers.map((x,index) => {..., x.id = uniqueID(); x.class = classes[index % n].name; x.club = 'GMK'} );
    //localracers.map((x,index) => {..., x.dns = false;x.dnf = false;x.lapmarkings=[]} );
    //localracers = localracers.map((x,index) => ({...x, id : uniqueID(), class: classes[index % n].name, club : 'GMK'}) );
    //localracers = localracers.map((x,index) => ({...x, dns: false, dnf:false, lapmarkings:[], }) );
    return localracers
}