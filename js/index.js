window.addEventListener('load', (event) => {
    window.Game = {
        defaultOptions: {
            canvasId: 'canvas',
            paragraphId: 'poem',
            size: 8,
            poem: [
                ['smo', 'Jak', 'wio-', 'ka', 'ci\u0119','\u017cy-','ta','S\u0142o-'],
                ['wo','mi-','pi-','o-','wi-','wi-','dzie-','cie,'],
                ['cie','na-','tek','sen-','we','wo','nie;','wio-'],
                ['lu-','o-','kwie-','czu-','ch\u0119t-','sn\u0119,','no-','de'],
                ['sze.','kwia-','cie','No-','ne','cia','wio-','tchnie-'],
                ['Przyjm-','chne','Jak','nie','u-','we','M\u0142o-','ra-'],
                ['wszy','m\u0142o-','nie','pta-','ne.','dzie-','dzi','sen-'],
                ['pie-','sz\u0119','Pier-','de','Bu-','ne','dos-','ci\u0119,'],
                ]
        },
    
    
        ctx: null,
        canvas: null,
        paragraph: null,
        tiles: null,
        size: null,
        selectedTiles: [],
        possibleMoves: [],
        animationFrameId: null,
        options: {},
    
        init: function (options = {}) {
            this.onMouseDown = this.onMouseDown.bind(this);
            this.draw = this.draw.bind(this);

            this.options = Object.assign(this.defaultOptions, options);
    
            this.canvas = document.getElementById(this.options.canvasId);
            this.ctx = this.canvas.getContext('2d');
            this.canvas.removeEventListener('mousedown', this.onMouseDown)
            this.canvas.addEventListener("mousedown", this.onMouseDown);
            this.size = this.canvas.width/this.options.size;

            this.start();
            return this;
        },
    
        start: function () {
            this.tiles = this.options.poem.flat().map((v, i) => new Tile(Math.floor(i/8), i % 8, v, this.size));
            this.selectedTiles = [];
            this.possibleMoves = [];
            
            this.paragraph = document.getElementById(this.options.paragraphId);
            this.paragraph.innerText = '';
            
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = requestAnimationFrame(this.draw);
           
        },
    
        draw: function() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            for (let tile of this.tiles) {
                tile.draw(this.ctx);
            }
    
            for (let tile of this.possibleMoves) {
                tile.highlight(this.ctx)
            }
            if (this.selectedTiles.length > 0) {
                const lastTile = this.selectedTiles[this.selectedTiles.length - 1];
                lastTile.markAsLast(this.ctx)
            }
          
            this.animationFrameId = requestAnimationFrame(this.draw);
        },
    
        onMouseDown: function (event) {
            event.preventDefault();
            var x = event.x;
            var y = event.y;
            x -= this.canvas.offsetLeft;
            y -= this.canvas.offsetTop;
           // console.log(x,y)
            const row = Math.floor(y/this.size);
            const col = Math.floor(x/this.size);
            
            let tile = null;
            if (this.selectedTiles.length == 0) {
                tile = this.tiles.find($tile => $tile.row == row && $tile.col == col);
            } else {
                tile = this.possibleMoves.find($tile => $tile.row == row && $tile.col == col);
                if (!tile) {
                    const lastTile = this.selectedTiles[this.selectedTiles.length - 1];
                    if (lastTile.row == row && lastTile.col == col) {
                        lastTile.unselect()
                        this.selectedTiles.pop();
                        const previousTile = this.selectedTiles.pop();
                        if (previousTile) {
                            this.possibleMoves = previousTile.getPossibleMoves(this.size)
                            .map(pos => this.tiles.find($tile => $tile.row == pos.row && $tile.col == pos.col))
                            .filter(tile => !tile.selected);
                        this.selectedTiles.push(previousTile);
                        } else {
                            this.possibleMoves = [];
                        }
                    }
                }
            }
            
            if(tile) {
                tile.select();
                this.possibleMoves = tile.getPossibleMoves(this.size)
                    .map(pos => this.tiles.find($tile => $tile.row == pos.row && $tile.col == pos.col))
                    .filter(tile => !tile.selected);
                this.selectedTiles.push(tile);
                }
                let poem = this.selectedTiles.reduce((acc, tile, i) =>  acc + tile.text + ( i && (i+1) % 8 == 0 ? '\n' : ' '), '');
                poem = poem.replace(/\- /gi,'');
            //    console.log(poem);
               this.paragraph.innerText = poem;
        }
    }.init();
    
});

function Tile(row, col, text, size) {
    this.row = row;
    this.col = col;
    this.text = text;
    this.size = size;
    this.selected = false;
    this.offset = 1;

    this.draw = (ctx) => {
        const x = this.col * this.size;
        const y = this.row * this.size
        ctx.strokeRect(x, y, this.size, this.size);
        if (this.selected) {
            ctx.save();
            ctx.fillStyle = '#ff6f69'
            ctx.fillRect(x + this.offset, y + this.offset, this.size - this.offset*2, this.size - this.offset*2);
            ctx.restore();
        }
        ctx.textAlign = 'center';
        ctx.font = '20px serif';
        ctx.save();
        ctx.fillStyle = this.selected ? '#ffffff' : '#000000';
        ctx.fillText(this.text, x + this.size/2, y + this.size/2);
        ctx.restore();
        // if (this.selected) {
        //     drawPossibleNextMoves(ctx, this.row, this.col)
        // } 
     
    }

    this.markAsLast = (ctx) => {
        const x = this.col * this.size;
        const y = this.row * this.size
        ctx.strokeRect(x, y, this.size, this.size);
        ctx.fillStyle = '#0392cf'
        ctx.fillRect(x + this.offset, y + this.offset, this.size - this.offset*2, this.size - this.offset*2);
      
        ctx.textAlign = 'center';
        ctx.font = '20px serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(this.text, x + this.size/2, y + this.size/2);
        ctx.restore();
    }
    this.getPossibleMoves= (size) => {
        let moves = move(this.row, this.col);
        const possibleMoves = [];
        while(!(data=moves.next()).done) {
            const pos = data.value;
            if (isLegal(pos, size)) {
                possibleMoves.push(pos);
            }
        }

        return possibleMoves;
    }

    // drawPossibleNextMoves = (ctx,startRow, startCol ) => {
    //     let moves = move(startRow, startCol);
    //     while(!(data=moves.next()).done) {
    //         const pos = data.value;
    //         if (isLegal(pos)) {
    //             ctx.save();
    //             ctx.fillStyle = '#ffb6b3';
    //             ctx.fillRect(pos.col* this.size, pos.row* this.size, this.size, this.size);
    //             ctx.restore();
    //         }
    //     }
    // }

    this.highlight = (ctx) => {
        const x = this.col * this.size;
        const y = this.row * this.size
        ctx.save();
        ctx.fillStyle = '#ffb6b3';
        ctx.fillRect(x + this.offset, y + this.offset, this.size - this.offset*2, this.size - this.offset*2);
        // ctx.fillRect(x, y, this.size, this.size);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(this.text, x + this.size/2, y + this.size/2);
        ctx.restore();
    }

    move = function*(startRow, startCol) {
        let n = 0;
        while (n < 8) {
          let row = startRow + (n < 4 ? 2 : 1)*Math.pow(-1, n%4 < 2 ? 0 : 1);
          let col = startCol +  (n < 4 ? 1 : 2)*Math.pow(-1, n%2)
          yield {row, col}
           n++;
        }
      }

      isLegal = (pos, size) => {
          const inBounds = v => v >= 0 && v < 8;
        return inBounds(pos.row) && inBounds(pos.col);
      }


 
    this.toogle = () => {
        this.selected = !this.selected;
    }

    this.select = () => {
        this.selected = true;
    }

    this.unselect = () => {
        this.selected = false;
    }
}

