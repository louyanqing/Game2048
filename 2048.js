
/*为html元素设置class属性:
		1.网页中一切元素都是一个对象:
		2.html标准属性都可以用对象.方式访问
		3.特殊：html中的class --> className
				因为class属性默认表示一个对象的类型名，是内部属性
------------------------------------------------------------------*/
/*习惯：
	1.对象自己的方法访问自己属性或者调用自己的其他方法时，必须加this
	2.对象的每个属性和方法间都要用逗号分隔！ Unexpected identifier
----------------------------------------------------------------------*/
if(!Function.prototype.bind){
	Function.prototype.bind=function(obj){
		var fun=this;
		var args=Array.prototype.slice.call(arguments,1);
		return function(){
			fun.apply(obj,args.concat(
				Array.prototype.slice.call(arguments)	
			));
		}
	}
}

function $(id){
	return document.getElementById(id);
}
var game={
	data:[],//保存4*4个单元格中数据的二维数组
	RN:4,//总行数
	CN:4,//总列数
	score:0,//
	top:0,//最高分
	state:1,//游戏的状态：进行中1，结束0
	RUNNING:1,//运行状态
	GAMEOVER:0,//结束状态
	PLAYING:1,//动画播放中状态
	init:function(){//初始化所有格子div的html代码
		$("gridPanel").style.width=this.CN*116+16+"px";
		$("gridPanel").style.height=this.RN*116+16+"px";
		var grids=[];
		var cells=[];
		for(var r=0;r<this.RN;r++){//遍历行，r从0开始，到<RN结束，每次++
			for(var c=0;c<this.CN;c++){//遍历列，c从0开始，到<CN结束，每次++
				grids.push('<div id="g'+r+c+'" class="grid"></div>');//在grids中push一个字符串：
				cells.push('<div id="c'+r+c+'" class="cell"></div>');//在cells中push一个字符串：
			}
		}//遍历结束
		//找到id为gridPanel的div，设置内容为：grids的无缝拼接的结果+cells无缝拼接的结果
		$("gridPanel").innerHTML=grids.join("")+cells.join("");
	},
	start:function(){/* 游戏启动start方法 */
		this.init();//生成游戏界面
		animation.init();
		var self=this;//留住this,闭包,技巧
		//将data初始化为RN x CN的二维数组，每个元素初始化为0
		//遍历每一行RN,r从0开始，到<RN结束
		  //在data中压入一个空数组
		  //遍历行中每个格,c从0,到<CN结束
		    //将data中当前位置设置为0
		for(var r=0;r<self.RN;r++){
			self.data.push([]);
			for(var c=0;c<self.CN;c++){
				self.data[r][c]=0;
			}
		}
		this.score=0;//初始化成绩为0
		$("top").innerHTML=this.getTop();
		this.state=this.RUNNING;//初始化游戏状态为运行
		$("gameOver").style.display="none";
		//以两个随机数开始游戏
		self.randomNum();
		self.randomNum();
		self.updateView();
		//console.log(this.data.join("\n"));
		//绑定键盘事件:当键盘按下时，自动触发
		document.onkeydown=function(e){
			//获得事件对象:
			//var e=window.event||arguments[0];
			//alert(e.keyCode);
			if(this.state==this.RUNNING){
				switch(e.keyCode){//通过事件获得键盘按键的unicode
					case 37:self.moveLeft();break;
					case 38:self.moveUp();break;
					case 39:self.moveRight();break;
					case 40:self.moveDown();break;
				}
			}	
		}
	},
		
	randomNum:function(){/* 生成1个随机数的方法 */

		for(;;){//死循环
			//在0-RN-1之间生成一个随机行号，保存在变量r中
			//在0-CN-1之间生成一个随机列号，保存在变量c中
			//如果data中r行c列的元素==0
			//	再生成一个随机数，
			//	如果<0.5，就在data中r行c列放入2，否则放入4，使2、4出现的概率相同，一半一半
			//	退出循环
			var r=Math.floor(Math.random()*this.RN);//不把值写死
			var c=Math.floor(Math.random()*this.CN);//生成随机位置
			if(this.data[r][c]==0){
				var n=Math.random();
				//n<0.5?this.data[r][c]=2:this.data[r][c]=4;
				this.data[r][c]=n<0.5?2:4;
				break;
			}
		}
	},
	updateView:function(){/* 页面显示：底层程序代言人 */
		/*遍历data中每个元素
		**  拼id:"c"+r+c
		**  使用$找到指定id的格子div对象，保存在变量div中
		**  如果当前元素的值为0
		**    将div的内容设置为""
		**    设置div的class属性为 "cell"
		**  否则(格子里面有数)
		**    将div的内容设置为当前元素
		**    设置div的class属性为 "cell n"+?
		*/
		for(var r=0;r<this.RN;r++){
			for(var c=0;c<this.CN;c++){
				var id="c"+r+c;
				var div=$(id);
				if(this.data[r][c]==0){
					div.innerHTML="";
					div.className="cell";
				}else{
					div.innerHTML=this.data[r][c];
					div.className="cell n"+this.data[r][c];
				}
			}
		}

		var span=$("score");
		span.innerHTML=this.score;//span对象
		
		var div=$("gameOver");//找到id为gameOver的div，保存到变量div中
		if(this.isGameOver()){//调用isGameOver方法，如果返回true
			this.state=this.GAMEOVER;//修改游戏状态为GAMEOVER
			$("finalScore").innerHTML=this.score;
			div.style.display="block";//修改div为显示
			
			if(this.score>this.getTop()){
				this.setTop(this.score);
			}
		} 
										
										
	},
	setTop:function(value){//将value写入cookie中的top变量
		var now=new Date();
		now.setFullYear(now.getFullYear()+1);
		document.cookie="top="+value+";expires="+now.toGMTString();
	},	
	getTop:function(){//从cookie中读取top变量的值
		var top=parseInt(document.cookie.slice(4));
		return isNaN(top)?0:top;
	},
	isGameOver:function(){/* 游戏结束 */
		for(var r=0;r<this.RN;r++){
			for(var c=0;c<this.CN;c++){
				if(this.data[r][c]==0){return false;}
				else if(c<this.CN-1&&this.data[r][c]==this.data[r][c+1]){
					return false;
				}
				else if(r<this.RN-1&&this.data[r][c]==this.data[r+1][c]){
					return false;
				}
			}
		}
		return true;
	},
	move:function(iterator){//iterator专门执行for的函数
		var before=this.data.toString();
		iterator.call(this);
		var after=this.data.toString();
		if(before!=after){//如果本次发生了移动，
			this.state=this.PLAYING;//修改游戏状态为播放动画状态
									//播放动画状态下，不响应键盘事件
			//启动动画，传入回调函数
			//回调函数在动画播放完成后，自动执行
			//动画完成后，生成随机数，更新页面，修改动画状态为运行状态，才可继续响应按键事件
			//回调函数要提前绑定this为game对象。
			animation.start(
				function(){
					this.randomNum();//生成一个随机数
					this.updateView();//更新界面
					this.state=this.RUNNING;
				}.bind(this)	
			);
		}
	},
	/* 左移 */
	
	moveLeft:function(){//遍历每一行，针对每一行执行左移								
		this.move(function(){
			for(var r=0;r<this.RN;r++){//遍历data中的每一行,每遍历一行就调用一次，传入r
				this.moveLeftInRow(r);
			}
		});			
	},
	moveLeftInRow:function(r){//仅移动指定的一行				
		for(var c=0;c<this.CN-1;c++){//从0位置开始，到<CN-1(<=CN-2)结束，遍历r行中每个元素
			var nextc=this.getRightInRow(r,c);//查找当前位置右侧下一个不为0的位置，保存在nextc中
			//console.log(nextc);
			if(nextc==-1){break;}//如果没找到,退出循环
			else{//否则
				if(this.data[r][c]==0){//如果当前元素是0
					this.data[r][c]=this.data[r][nextc];//将nextc位置的值换到当前位置
					this.data[r][nextc]=0;//将nextc位置设置为0
					animation.addTask($("c"+r+nextc),r,nextc,r,c);
					c--;//c留在原地(抵消循环中的变化)
				}else{//否则
					if(this.data[r][c]==this.data[r][nextc]){// 如果当前元素==nextc位置的元素
						this.data[r][c]*=2;//将当前位置*=2
						this.data[r][nextc]=0;//将nextc位置设置为0
						this.score+=this.data[r][c];//将合并后的当前元素值，计入总分
						animation.addTask($("c"+r+nextc),r,nextc,r,c);
					}
				}
			}
		}
	},
	getRightInRow:function(r,c){//查找指定位置右侧下一个不为0的位置下标

		for(var nextc=c+1;nextc<this.CN;nextc++){
			if(this.data[r][nextc]!=0){return nextc;}
		}
		return -1;
	},
	
	/* 右移 */
	
	moveRight:function(){//遍历每一行，针对每一行执行右移
		this.move(function(){
			for(var r=0;r<this.RN;r++){
				this.moveRightInRow(r);
			}
		});
	},
	moveRightInRow:function(r){//仅移动指定的一行	
		for(var c=this.CN-1;c>0;c--){//从RN-1位置开始，到>0结束，遍历r行中每个元素
			var prevc=this.getLeftInRow(r,c);//查找当前位置左侧下一个不为0的位置，保存在nextc中
			if(prevc==-1){break;}//如果没找到，退出循环
			else{//否则
				if(this.data[r][c]==0){//如果当前元素是0
					this.data[r][c]=this.data[r][prevc];//将nextc位置的值换到当前位置
					this.data[r][prevc]=0;//将nextc位置设置为0
					animation.addTask($("c"+r+prevc),r,prevc,r,c);
					c++;//c留在原地(抵消循环中的变化)，与循环增量相逆
				}else{//否则 如果当前元素==nextc位置的元素
					if(this.data[r][c]==this.data[r][prevc]){
						this.data[r][c]*=2;//将当前位置*=2
						this.data[r][prevc]=0;//将nextc位置设置为0
						this.score+=this.data[r][c];
						animation.addTask($("c"+r+prevc),r,prevc,r,c);
					}
				}
			}
		}
	},
	getLeftInRow:function(r,c){//查找指定位置左侧下一个不为0的位置下标
		for(var prevc=c-1;prevc>=0;prevc--){//nextc从c+1开始，遍历r行右侧剩余元素
			if(this.data[r][prevc]!=0){return prevc;}//	如果当前位置!=0，返回nextc
		}//(遍历结束)
		return -1;//返回-1		
	},
	
	/* 上移 */
	
	moveUp:function(){//遍历每一列，针对每一列执行上移
		this.move(function(){
			for(var c=0;c<this.CN;c++){
				this.moveUpInColumn(c);
			}
		});
	},
	moveUpInColumn:function(c){	//仅移动指定的一列	
		for(var r=0;r<this.RN-1;r++){//只需要遍历到RN-2
			var nextr=this.getDownInColumn(r,c);
			if(nextr==-1){break;}
			else if(this.data[r][c]==0){
				this.data[r][c]=this.data[nextr][c];
				this.data[nextr][c]=0;
				animation.addTask($("c"+nextr+c),nextr,c,r,c);
				r--;
			}
			else if(this.data[r][c]==this.data[nextr][c]){
				this.data[r][c]*=2;
				this.data[nextr][c]=0;
				this.score+=this.data[r][c];
				animation.addTask($("c"+nextr+c),nextr,c,r,c);
			}
		}
	},
	getDownInColumn:function(r,c){//查找指定位置下侧下一个不为0的位置下标
		for(var nextr=r+1;nextr<this.RN;nextr++){
			if(this.data[nextr][c]!=0){return nextr;}
		}
		return -1;
	},

	/* 下移 */
	
	moveDown:function(){
		this.move(function(){
			for(var c=0;c<this.CN;c++){
				this.moveDownInColumn(c);
			}
		});	
	},
	moveDownInColumn:function(c){
		for(var r=this.RN-1;r>0;r--){
			var nextr=this.getUpInColumn(r,c);
			if(nextr==-1){break;}
			else if(this.data[r][c]==0){
				this.data[r][c]=this.data[nextr][c];
				this.data[nextr][c]=0;
				animation.addTask($("c"+nextr+c),nextr,c,r,c);
				r++;
			}
			else if(this.data[r][c]==this.data[nextr][c]){
				this.data[r][c]*=2;	
				this.data[nextr][c]=0;
				this.score+=this.data[r][c];
				animation.addTask($("c"+nextr+c),nextr,c,r,c);
			}
		}
	},
	getUpInColumn:function(r,c){
		for(var nextr=r-1;nextr>=0;nextr--){
			if(this.data[nextr][c]!=0){return nextr;}
		}
		return -1;
	}
};

//页面加载后事件：页面加载后自动触发！
window.onload=function(){//当窗口加载后自动加载这个函数
	game.start();

}