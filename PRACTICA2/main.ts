  type producto = {
    id: number,
    nombre: string,
    precio: number
  }

  const productos = [

    { id: 1, nombre: 'Producto A', precio: 30 },
    
    { id: 2, nombre: 'Producto B', precio: 20 },
    
    { id: 3, nombre: 'Producto C', precio: 50 },
    
    { id: 4, nombre: 'Producto D', precio: 10 }
    
    ];
    
    const handler = async (req: Request): Promise<Response> => {
      const method = req.method;
      const url = new URL(req.url);
      const path = url.pathname;
    
      if (method === "GET") {
        if (path === "/productos") {
          const min  = url.searchParams.get("minPrecio");
          const max  = url.searchParams.get("maxPrecio");
          if(min && max){
            const maxMinProducts = productos.filter((elem) => elem.precio >= parseInt(min)).filter((elem) => elem.precio<=parseInt(max));
            if(maxMinProducts.length>0)
            return new Response(JSON.stringify(maxMinProducts));
            else
              return new Response("No se han encontrado productos entre esos valores", {status: 404})
          }else if(min){
            const minProducts = productos.filter((elem) => elem.precio>=parseInt(min));
            if(minProducts.length>0)
              return new Response(JSON.stringify(minProducts));
            else
              return new Response("No se han encontrado productos entre esos valores", {status: 404});
          }else if (max){
            const maxProducts = productos.filter((elem) => elem.precio<=parseInt(max));
            if(maxProducts.length>0)
              return new Response(JSON.stringify(maxProducts));
              else
                return new Response("No se han encontrado productos entre esos valores", {status: 404})
          }
          return new Response(JSON.stringify(productos));
        }
        else if(path.startsWith('/producto/')){
          const id = Number(path.split("/")[2]);
          const product = productos.find((u) => u.id === id);
          console.log(id)

          if(id){
            return new Response(JSON.stringify(product));
          }else
            return new Response("Producto no encontrado", {status: 404});
        }
        else if(path === "/calcular-promedio"){
          const min  = url.searchParams.get("minPrecio");
          const max  = url.searchParams.get("maxPrecio");
          let result = productos;
          if(min && max){
            const maxMinProducts = productos.filter((elem) => elem.precio >= parseInt(min)).filter((elem) => elem.precio<=parseInt(max));
            if(maxMinProducts.length>0)
              result = maxMinProducts;
            else
              return new Response("No se han encontrado productos entre esos valores", {status: 404})
          }else if(min){
            const minProducts = productos.filter((elem) => elem.precio>=parseInt(min));
            if(minProducts.length>0)
              result = minProducts;
            else
              return new Response("No se han encontrado productos entre esos valores", {status: 404})
          }else if (max){
            const maxProducts = productos.filter((elem) => elem.precio<=parseInt(max));
            if(maxProducts.length>0)
              result = maxProducts;
            else
              return new Response("No se han encontrado productos entre esos valores", {status: 404})   
          }
          const promedio = result.reduce((acc, elem)=>{
            return (acc + elem.precio);
          }, 0) / result.length
              return new Response('Promedio: ' + promedio);
        }
        
      }
      return new Response("endpoint not found", { status: 404 });

  };
        Deno.serve({ port: 3000 }, handler);
    