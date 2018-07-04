export class FloodingStation {
    constructor(
        public station: string, 
        public recordTime: Date,
        public lat: number,
        public lon: number,
        public score: number,
        public changed?: Boolean

        ){}
}