var n:number = 5; //numero de discos

function torre(discos: number, origen:string, destino: string, aux: string): void{
    
    if(discos==1){
        console.log("Mueva el disco " + discos + " desde la torre " + origen + " a la torre " + destino + "/n");
    }

    else if(discos > 1){
    torre(discos-1, origen, aux, destino);
        console.log("Mueva el disco " + discos + " desde la torre " + origen + " a la torre " + destino + "/n");
    torre(discos-1, aux, destino, origen);
    }
    else{
        console.log("El numero de discos tiene que ser mayor que 0");
    }
};

torre(n, "UNO", "TRES", "DOS");//UNO -> Origen, TRES -> Destino

