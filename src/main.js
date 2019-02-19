function Pig(root) {
    this.root = root;
    this.db = firebase.firestore();
    this.storage = firebase.storage();
    this.storageRef = this.storage.ref();
    this.urlIMG = "";
    this._boolModal = false;
    this.__init.call(this)
}
Pig.prototype = {
    __init: function () {
        setTimeout(() => {
            this.__preloader();
            setTimeout(() => {
                this.__isLogined(this.db);
                this.__loginReg(this.db, this.storageRef);
            }, 1000);     
        }, 0)
        // setInterval(()=>{
            // this.__intervalChanges(this.db)
        // }, 2000)
    },
    __preloader: () => {
        this.root.innerHTML += `
            <div class="preloader">
                <img class="preloaderPIG" src="./img/pigLoader.gif">
            </div>
        `;
    },
    __intervalChanges:(DB)=>{
        DB.collection("users").get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                
                let _update =null;
                pig.db.collection('users').doc(doc.id).get().then(function(query){
                    _update = query.data()
                    if(_update.pigs.length > 10){
                        if(document.getElementById(doc.id).classList.contains('female')){
                            document.getElementById(doc.id).children[0].style.width = "80%"
                        }
                        else if(document.getElementById(doc.id).classList.contains('male')){
                            document.getElementById(doc.id).children[0].style.height = "70%"
                        }
                    }
                    Array.prototype.map.call(_update.pigs, (elem, id)=>{
                        if(elem.healty < 0){
                            _update.pigs.splice(id, 1);
                            pig.db.collection('users').doc(doc.id)
                            .update(_update);
                        }
                        let pigSort = null, priceTime = 1, currectWeight = 10;
                        if(elem.sort == "lower"){
                            priceTime*= 1;
                            pigSort = "smallPig.png";
                        }
                        else if(elem.sort == "medium"){
                            priceTime*= 2;
                            pigSort = "mediumPig.png";
                        }
                        else if(elem.sort == "big"){
                            priceTime*= 3;
                            pigSort = "bigPig.png";
                        }
                        _update.pigs[id].hungryLevel = 100 - Number((Number((100/120).toFixed(1))* Number((Math.round((new Date().getTime()/1000)-elem.buyDate.seconds)/3600).toFixed(1))).toFixed(1));
                        _update.pigs[id].healty = _update.pigs[id].hungryLevel;
                        _update.pigs[id].weight = _update.pigs[id].feed + Math.ceil(Number((Math.round((new Date().getTime()/1000)-elem.buyDate.seconds)/3600).toFixed(1)/24));
                        // _update.pigs[id].weight = (currectWeight + 
                        //     Math.ceil(Number((Math.round((new Date().getTime()/1000)-elem.buyDate.seconds)/3600).toFixed(1)/24)) + 
                        //     (_update.pigs[id].weight - (currectWeight + 
                        //         Math.ceil(Number((Math.round((new Date().getTime()/1000)-elem.buyDate.seconds)/3600).toFixed(1)/24)))));
                        
                        _update.pigs[id].price = Math.round((priceTime*(_update.pigs[id].weight)*10)*_update.pigs[id].healty/100);
                        pig.db.collection('users').doc(doc.id)
                        .update(_update);

                    })
                })
            })
        })
    },
    __showFarm: (DB) => {
        if(document.querySelector('.vilage')){
            document.querySelector('.vilage').remove()
        }
        pig.root.innerHTML += `
        <div class="vilage"></div>
        `;
        DB.collection("users").get().then((querySnapshot) => {
            let genderPlace = '', index = -1;
            querySnapshot.forEach((doc) => {
                index++;
                genderPlace = (doc.data().gender == 'male') ? "male" : "female";
                let genderBlock  = document.createElement("div");
                genderBlock.className = genderPlace;
                genderBlock.setAttribute("id", doc.id);
                if(firebase.auth().currentUser && firebase.auth().currentUser.email == doc.data().login){
                    genderBlock.classList.add('myPlace')
                }
                genderBlock.innerHTML = '<div class="fance"></div>'; 
                document.querySelector('.vilage').appendChild(genderBlock);
                for (let i = 0; i < doc.data().pigs.length; i++) {
                    let img = document.createElement("img");
                    img.setAttribute('data-size', doc.data().pigs[i].sort)
                    img.src = './img/pigs.gif';
                    if(doc.data().pigs[i].healty < 0){
                        let _update = null;
                        pig.db.collection('users').doc(doc.id).get().then((query)=>_update = query.data()).then(function(){
                            _update.pigs.splice(i, 1);
                            pig.db.collection('users').doc(doc.id)
                            .update(_update);
                        })
                    }
                    else{
                        document.querySelectorAll(`.fance`)[index].appendChild(img);
                    }
                    // setTimeout(()=>{
                        
                        pig.__timeOutRadom(img, document.querySelectorAll(`.fance`)[index])
                    // }, 1000);
                }
                genderBlock.onclick = function(){
                    let _update = null;
                    let id = this.getAttribute("id");
                    pig.db.collection('users').doc(this.getAttribute("id")).get().then((query)=>_update = query.data()).then(function(){
                        pig.__individualFarm(id)
                        document.onclick = (e)=>{
                            if (e.target.closest('.individual') && !e.target.closest('.indivChild')) {
                                if(document.querySelector('.individual')){
                                    document.querySelector('.individual').remove()
                                }
                            }
                        }
                    })
                }
            });
        });
    },
    __individualFarm:(docID)=>{
        let _indiv = document.createElement("div");
        let _indivChild = document.createElement("div");
        _indiv.className = 'individual';
        _indivChild.className = 'indivChild';
        _indivChild.innerHTML = `
            <img class='preloadMyFram' src='./img/preloaderGIF.gif'>
        `;
        let _update = null; 
        pig.db.collection('users').doc(docID).get().then(function(query){
            _update = query.data()
            document.querySelector('.preloadMyFram').remove();
            let user = document.createElement('div'),
                avatar = (_update.avatar == "")?"./img/default.png":_update.avatar;
            user.className = "userBadge";
            user.innerHTML = `
                <img src=${avatar}>
                <span>${_update.fullName}</span>
            `
            _indivChild.appendChild(user);
            Array.prototype.map.call(_update.pigs, (elem, ind)=>{
                let pigSort = null, priceTime = 1, currectWeight = 10;
                if(elem.sort == "lower"){
                    priceTime*= 1;
                    pigSort = "smallPig.png";
                }
                else if(elem.sort == "medium"){
                    priceTime*= 2;
                    pigSort = "mediumPig.png";
                }
                else if(elem.sort == "big"){
                    priceTime*= 3;
                    pigSort = "bigPig.png";
                }
                
                _update.pigs[ind].hungryLevel = 100 - Number((Number((100/120).toFixed(1))* Number((Math.round((new Date().getTime()/1000)-elem.buyDate.seconds)/3600).toFixed(1))).toFixed(1));
                _update.pigs[ind].healty = _update.pigs[ind].hungryLevel;
                _update.pigs[ind].weight = _update.pigs[ind].feed + Math.ceil(Number((Math.round((new Date().getTime()/1000)-elem.buyDate.seconds)/3600).toFixed(1)/24));
                _update.pigs[ind].price = Math.round((priceTime*(_update.pigs[ind].weight)*10));
                pig.db.collection('users').doc(docID)
                .update(_update);
                _eachBadge = `
                    <div class="pigBadge">
                        <div class="imgWrap">
                            <img src="./img/${pigSort}">
                        </div>
                        <div class="healty_hungry">
                            <label>Healty</label>
                            <p class="healty">
                                <span class="progress">
                                    <span class="active" style="width:${elem.healty}%"></span>    
                                </span>
                                <span class="prozent_healty">${elem.healty.toFixed(1)}%</span>
                            </p>
                            <label>Hungry</label>
                            <p class="hungry">
                                <span class="progress">
                                    <span class="active" style="width:${elem.hungryLevel}%"></span>
                                </span>
                                <span class="prozent_hungry">${elem.hungryLevel.toFixed(1)}%</span>
                            </p>
                        </div>
                        <div class="priceWrap">
                            <p>
                                <label>Weight:</label>
                                <span class="priceValue">${elem.weight}kg</span>
                            </p>
                            <p>
                                <label>Price:</label>
                                <span class="priceValue">${elem.price}$</span>
                            </p>
                        </div>
                    </div>
                `;
                _indivChild.innerHTML += _eachBadge;
            })
        });
        _indiv.appendChild(_indivChild)

        pig.root.appendChild(_indiv);
    },
    __timeOutRadom: (img, fance)=> {
        img.classList.remove('rotate')
        let _parent = fance.getBoundingClientRect(),
            _maxTop = 0,
            _maxLeft = 0;
            let _randTop = Math.floor(Math.random() * Math.floor(Number(_parent.height))),
                _randLeft = Math.floor(Math.random() * Math.floor(Number(_parent.width))),
                _beforeLeft = 0;
            _maxTop = (_randTop >= _parent.height - 30) ? _randTop - 30 : _randTop;
            if (img.getAttribute('style')) {
                _beforeLeft = Number(window.getComputedStyle(img, null).getPropertyValue("left").split("px")[0]);
            }
            _maxLeft = (_randLeft >= _parent.width - 30) ? _randLeft - 30 : _randLeft;
            if (_beforeLeft > _maxLeft) {
                img.classList.add('rotate');
            }
            img.style.top = _maxTop + "px";
            img.style.left = _maxLeft + "px";
        setTimeout(() => {
            pig.__timeOutRadom(img, fance)
        }, 8000)
    },
    __loginReg: (DB, storREF) => {
        firebase.auth().onAuthStateChanged((user)=> {
            if (!user) {
                this.root.innerHTML += `
                    <div class="loginReg">
                        <h5 data-pig="pig">Everything is a lie, keep a </h5>
                        <div class="loginWrap">
                            <form name="signInForm" id="signIn">
                                <input name="login" type="text" placeholder="Login" required>
                                <input name="password" type="password" placeholder="Password" required>
                                <div class="orReg">
                                    <a href="javascript:void(0)" class="goToReg">Sign up</a>
                                    <button type="submit">Sign in</button>
                                </div>
                            </form>    
                        </div>
                        <div class="regWrap">
                            <span class="lnr lnr-chevron-left"></span>    
                            <form name="myForm" id="createUser" >
                                <input name="email" type="email" placeholder="Email" required>
                                <input  name="firstName" type="text" placeholder="Full Name" required>
                                <input  name="password" type="password" placeholder="Password" required>
                                <div style="width:100%; display:flex; margin-bottom:10px">
                                    <label style="display:flex; align-items:center; margin-right:10px; cursor:pointer"> <input type="radio" name="gender" value="male"> :Male</label>
                                    <label style="display:flex; align-items:center; margin-right:10px; cursor:pointer"> <input type="radio" name="gender" value="female"> :Female</label>
                                </div>
                                <label class="file-label">
                                    <input class="file-input onChangeAvatar"type="file" >
                                    <span class="file-cta">
                                        <span class="file-icon">
                                        <i class="fa fa-upload"></i>
                                        </span>
                                        <span class="file-label">
                                        choses Image...
                                        </span>
                                    </span>
                                </label>
                                <div class="avatarWrap">
                                    <img>
                                </div> 
                                <button type="submit">Register</button>
                            </form>
                        </div>
                    </div>
                `;
                document.querySelector('.goToReg').onclick = () => {
                    document.querySelector('.loginWrap').style.display = "none";
                    document.querySelector('.regWrap').style.display = "block";
                }
                document.querySelector('.regWrap span.lnr').onclick = () => {
                    document.querySelector('.regWrap').style.display = "none";
                    document.querySelector('.loginWrap').style.display = "block";
                }
                document.querySelector('.onChangeAvatar').onchange = () => {
                    document.querySelector('#createUser button').setAttribute("disabled", true);
                    var preview = document.querySelector('.avatarWrap img'); //selects the query named img
                    var file = document.querySelector('.onChangeAvatar[type=file]').files[0]; //sames as here
                    if (file) {
                        preview.src = URL.createObjectURL(file); // set src to file url
                    }
                    const uploadTask = storREF.child(`images/${file.name}`).put(file)
                    //create a child directory called images, and place the file inside this directory
                    uploadTask.on('state_changed', (snapshot) => {
                        // Observe state change events such as progress, pause, and resume
                    }, (error) => {
                        // Handle unsuccessful uploads
                        console.log(error);
                    }, () => {
                        // Do something once upload is complete
                        console.log('success');
                        storREF.child(`images/${file.name}`).getDownloadURL().then(url => {
                            pig.urlIMG = url;
                        })
                        document.querySelector('#createUser button').removeAttribute("disabled");
                    });
                }
                pig.__register(DB);
                pig.__signIn(DB);
            }
            setTimeout(()=>{
                if(document.querySelector('.preloader')){
                    document.querySelector('.preloader').style.opacity = '0';
                }
            }, 2000, setTimeout(() => {
                if(document.querySelector('.preloader')){
                    document.querySelector('.preloader').remove();
                }
            }, 3000))
        })

    },
    __isLogined: (DB) => {
        DB.collection("users").get().then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                if (firebase.auth().currentUser && doc.data().login == firebase.auth().currentUser.email) {
                    pig.__showFarm(pig.db);
                    if(document.querySelector('.loginReg')){
                        document.querySelector('.loginReg').style.display = "none";
                    }
                    let _userImage = (doc.data().avatar == "") ? './img/default.png' : doc.data().avatar;
                    pig.root.innerHTML += `
                        <div class="navBar">
                            <a href="javascript:void(0)" class="logoWrap">
                                <img src="./img/logo.png">
                            </a>
                            <div class="myCase">
                                <div class="myCoin">
                                    <img src="./img/coin.gif">
                                    <span class="coinCount">${doc.data().coin} $</span>
                                </div> 
                                <div class="myPigs">
                                    <img src="./img/pigCount.png">
                                    <span class="pigCount">${doc.data().pigs.length}</span>
                                </div> 
                                
                            </div>  
                            <div class="userWrap">
                                <img src=${_userImage}>
                                <span class="nameUser">${doc.data().fullName.split(" ")[0]}</span>    
                            </div>
                        </div>
                    `;
                    
                    document.querySelector('.userWrap img').onclick = () => {
                        if(document.querySelector(".individual")){
                            document.querySelector(".individual").remove()
                        }
                        pig._boolModal = !pig._boolModal;
                        pig.__userRightModal(doc.data(), pig._boolModal);
                        document.querySelector(".logOut").onclick = () => {
                            firebase.auth().signOut().then(function () {
                                if(document.querySelector('.loginReg')){
                                    document.querySelector('.loginReg').style.display = "block";
                                }
                                document.querySelector('.navBar').remove()
                                document.querySelector('.parentModal').remove();
                                window.location.reload()
                            }, function (error) {
                                console.error('Sign Out Error', error);
                            });
                        }
                        document.querySelector(".showMyFarm").onclick = (e) => {
                            pig.__myFarm(doc);
                            pig.__positionTriangle(e)
                        }
                        
                        document.querySelector(".goToShop").onclick = (e) => {
                            pig.__goToShop(doc);
                            pig.__positionTriangle(e)
                        }

                        document.onclick = (e) => {
                            if (e.target.closest('.parentModal') && !e.target.closest('.rightUserModal')) {
                                document.querySelector('.rightUserModal').classList.remove("showModal");
                                if(document.querySelector('.go_to_shop_wrap')){
                                    document.querySelector('.go_to_shop_wrap').remove()
                                }
                                if(document.querySelector('.myFramWrap')){
                                    document.querySelector('.myFramWrap').remove()
                                }
                                setTimeout(() => {
                                    document.querySelector('.parentModal').remove()
                                }, 400);
                                pig._boolModal = !pig._boolModal;
                            }
                        }
                    }
                    pig.__intervalChanges(pig.db)
                }
            });
            
        });
        
    },
    __positionTriangle:(e)=>{
        document.querySelector('.triangle').style.display = "block";
        document.querySelector('.triangle').style.top = e.target.getBoundingClientRect().top-78+"px"
    },
    __goToShop:(docData)=>{
        if(document.querySelector('.go_to_shop_wrap')){
            document.querySelector('.go_to_shop_wrap').remove()
        }
        let _goShop = document.createElement("div"),
            _eachBadge,
            _amount = 0,
            _prods = {
                pig:[
                    {imgSRC:'smallPig.png', price:"100", name:"Small Pig"},
                    {imgSRC:'mediumPig.png', price:"200", name:"Medium Pig"},
                    {imgSRC:'bigPig.png', price:"300", name:"Big Pig"},
                ]
            };
        _goShop.innerHTML = "<div class='allAmount'></div>"
        _goShop.className = "go_to_shop_wrap subPanel";
        for(let i =0; i< Object.keys(_prods).length; i++){
            for(let j =0; j < _prods[Object.keys(_prods)[i]].length; j++){
                _eachBadge = `
                    <div class="pig_shop_badge">
                        <div class="imgWrap">
                            <img src="./img/${_prods[Object.keys(_prods)[i]][j].imgSRC}">
                        </div>
                        <div class="descProd">
                            <h5>${_prods[Object.keys(_prods)[i]][j].name}</h5>
                            <p>Price: ${_prods[Object.keys(_prods)[i]][j].price}$</p>
                            <div class="add_input">
                                <input type="number" min="0" class="add_prod_input" data-price=${_prods[Object.keys(_prods)[i]][j].price}>
                                <button class="addProduct">Add</button>
                            </div>   
                        </div>
                    </div>
                `;
                _goShop.innerHTML += _eachBadge;
            }
        }
        pig.root.appendChild(_goShop);
        Array.from(document.querySelectorAll('.add_prod_input')).forEach(elem=>{
            elem.oninput = () =>{
                _amount = 0;
                let _update = null;
                pig.db.collection('users').doc(docData.id).get().then(function(query){ 
                    _update = query.data()
                    Array.from(document.querySelectorAll('.add_prod_input')).forEach(elem=>{
                        _amount+=Number(elem.value)*elem.getAttribute('data-price')
                    })
                    if(_amount <= _update.coin){
                        document.querySelector('.allAmount').innerText = `Total amount: ${_amount}$`
                    }
                    else{
                        alert("You don't have enough money!!!")
                    }
                })
            }
        })
        Array.from(document.querySelectorAll('.addProduct')).forEach(elem=>{
            elem.onclick = () =>{
                let _update = null;
                _amount=Number(elem.parentNode.children[0].value)*elem.parentNode.children[0].getAttribute('data-price');
                pig.db.collection('users').doc(docData.id).get().then(function(query){
                    _update = query.data()
                    if(_amount >_update.coin){
                        alert("You don't have enough money!!!")
                    }
                    else{
                        let pigItem = null;
                        _update.coin = _update.coin - _amount;
                        if(elem.parentNode.children[0].getAttribute('data-price') == "50"){
                            
                        }
                        else{
                            if(elem.parentNode.children[0].getAttribute('data-price') == "100"){
                                pigItem = { feed: 10, weight: 10, hungryLevel: 100, sort: "lower", buyDate:{seconds:Math.round((new Date().getTime()/1000))},healty: 100, price: 100 };
                            }
                            else if(elem.parentNode.children[0].getAttribute('data-price') == "200"){
                                pigItem = { feed: 10, weight: 10, hungryLevel: 100, sort: "medium", buyDate:{seconds:Math.round((new Date().getTime()/1000))},healty: 100, price: 200 };
                            }
                            else if(elem.parentNode.children[0].getAttribute('data-price') == "300"){
                                pigItem = { feed: 10, weight: 10, hungryLevel: 100, sort: "big", buyDate:{seconds:Math.round((new Date().getTime()/1000))},healty: 100, price: 300 };
                            }
                            for(let i =0; i< Number(elem.parentNode.children[0].value); i++){
                                _update.pigs.push(pigItem)
                                let img = document.createElement("img");
                                img.setAttribute('data-size', pigItem.sort)
                                img.src = './img/pigs.gif';
                                document.querySelector(`.myPlace .fance`).appendChild(img);
                                setTimeout(()=>{
                                    pig.__timeOutRadom(img, document.querySelector(`.myPlace .fance`))
                                }, 1000);
                            }
                        }
                        pig.db.collection('users').doc(docData.id)
                        .update(_update);
                        document.querySelector('.coinCount').innerText = _update.coin+"$";
                        document.querySelector('.pigCount').innerText = _update.pigs.length;
                        
                        
                    }
                })
            }
        })
    },
    __myFarm: (docData)=>{
        if(document.querySelector('.subPanel')){
            document.querySelector('.subPanel').remove()
        }
        if(document.querySelector('.individual')){
            document.querySelector('.individual').remove()
        }
        
        let _myFarm = document.createElement("div"),
            _eachBadge;
        _myFarm.className = "myFramWrap subPanel";
        _myFarm.innerHTML = "<img class='preloadMyFram' src='./img/preloaderGIF.gif'>"
        let _update = null; 
        pig.db.collection('users').doc(docData.id).get().then(function(query){
            _update = query.data()
            document.querySelector('.preloadMyFram').remove();
            Array.prototype.map.call(_update.pigs, (elem, ind)=>{
                let pigSort = null, priceTime = 1, currectWeight = 10;
                if(elem.sort == "lower"){
                    priceTime*= 1;
                    pigSort = "smallPig.png";
                }
                else if(elem.sort == "medium"){
                    priceTime*= 2;
                    pigSort = "mediumPig.png";
                }
                else if(elem.sort == "big"){
                    priceTime*= 3;
                    pigSort = "bigPig.png";
                }
                _update.pigs[ind].hungryLevel = 100 - Number((Number((100/120).toFixed(1))* Number((Math.round((new Date().getTime()/1000)-elem.buyDate.seconds)/3600).toFixed(1))).toFixed(1));
                _update.pigs[ind].healty = _update.pigs[ind].hungryLevel;
                _update.pigs[ind].weight = _update.pigs[ind].feed + Math.ceil(Number((Math.round((new Date().getTime()/1000)-elem.buyDate.seconds)/3600).toFixed(1)/24));
                // _update.pigs[ind].weight = (currectWeight + 
                //     Math.ceil(Number((Math.round((new Date().getTime()/1000)-elem.buyDate.seconds)/3600).toFixed(1)/24)) + 
                //     (_update.pigs[ind].weight - (currectWeight + 
                //         Math.ceil(Number((Math.round((new Date().getTime()/1000)-elem.buyDate.seconds)/3600).toFixed(1)/24)))));
                _update.pigs[ind].price = Math.round((priceTime*(_update.pigs[ind].weight)*10));
                pig.db.collection('users').doc(docData.id)
                .update(_update);
                _eachBadge = `
                    <div class="pigBadge">
                        <div class="imgWrap">
                            <img src="./img/${pigSort}">
                        </div>
                        <div class="healty_hungry">
                            <label>Healty</label>
                            <p class="healty">
                                <span class="progress">
                                    <span class="active" style="width:${elem.healty}%"></span>    
                                </span>
                                <span class="prozent_healty">${elem.healty.toFixed(1)}%</span>
                            </p>
                            <label>Hungry</label>
                            <p class="hungry">
                                <span class="progress">
                                    <span class="active" style="width:${elem.hungryLevel}%"></span>
                                </span>
                                <span class="prozent_hungry">${elem.hungryLevel.toFixed(1)}%</span>
                            </p>
                        </div>
                        <div class="priceWrap">
                            <p>
                                <label>Weight:</label>
                                <span class="priceValue">${elem.weight}kg</span>
                            </p>
                            <p>
                                <label>Price:</label>
                                <span class="priceValue">${elem.price}$</span>
                            </p>
                            <p>
                                <a href="javascript:void(0)" class="sell">Sell</a>
                                <a href="javascript:void(0)" class="feed">Feed</a>
                            </p>
                        </div>
                    </div>
                `;
                _myFarm.innerHTML += _eachBadge;
            })
            Array.from(document.querySelectorAll('.feed'), (element, ind)=>{
                element.onclick = () => {
                    _update.pigs[ind].healty = 100;
                    _update.pigs[ind].hungryLevel = 100;
                    _update.pigs[ind].buyDate.seconds = Math.round(new Date().getTime()/1000);
                    _update.pigs[ind].feed = _update.pigs[ind].weight;
                    pig.db.collection('users').doc(docData.id)
                    .update(_update);
                    document.querySelectorAll('.healty .progress .active')[ind].style.width = _update.pigs[ind].healty+"%";
                    document.querySelectorAll('.healty  .prozent_healty')[ind].innerText = _update.pigs[ind].healty+"%";
                    document.querySelectorAll('.hungry .progress .active')[ind].style.width = _update.pigs[ind].hungryLevel+"%";
                    document.querySelectorAll('.hungry .prozent_hungry')[ind].innerText = _update.pigs[ind].hungryLevel+"%";
                }
            })
            Array.from(document.querySelectorAll('.sell'), (element, ind)=>{
                element.onclick = () => {
                    let index = (document.querySelectorAll('.pigBadge')[ind])?ind:document.querySelectorAll('.sell').length-1;
                    _update.coin += _update.pigs[index].price; 
                    _update.pigs.splice(index,1)
                    pig.db.collection('users').doc(docData.id)
                    .update(_update);
                    document.querySelector('.coinCount').innerText = _update.coin+"$";
                    document.querySelector('.pigCount').innerText = _update.pigs.length;
                    document.querySelectorAll('.pigBadge')[index].remove();
                    document.querySelectorAll('.myPlace img')[index].remove();
                }
            })
        });

        pig.root.appendChild(_myFarm);
        /* This syntax is very good 
        var datetime = 1548486141*1000; // anything
        var date = new Date(datetime);
        var options = {
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour:'numeric', minute:'numeric', second:'numeric'
        };
        var result = date.toLocaleDateString('en', options);
        console.log(result, Math.floor(new Date().getTime()/1000)) */
    },
    __userRightModal: (_userData, _modalOpenBoolean) => {
        if (_modalOpenBoolean) {
            let _modalHTML = document.createElement("div");
            _modalHTML.classList.add("parentModal");
            _modalHTML.innerHTML = `
                <div class="rightUserModal">
                    <span class="triangle"></span>
                    <ul type="none">
                        <li><a href="javascript:void(0)" class="showMyFarm">My Farm</a></li>
                        <li><a href="javascript:void(0)" class="goToShop">Go to Shop</a></li>
                        <li><a href="javascript:void(0)" class="deleteAccount">Delete account</a></li>
                        <li><a href="javascript:void(0)" class="logOut">Log out</a></li>
                    </ul>  
                </div>
            `;
            pig.root.appendChild(_modalHTML);
            setTimeout(() => {
                document.querySelector('.rightUserModal').classList.add("showModal");
            }, 10)
        }
        else {
            document.querySelector('.rightUserModal').classList.remove("showModal");
            if(document.querySelector('.subPanel')){
                document.querySelector('.subPanel').remove();
            }
            setTimeout(() => {
                document.querySelector('.parentModal').remove()
            }, 400)
        }
    },
    __register: (DB) => {
        document.querySelector('#createUser').onsubmit = (e) => {
            firebase.auth().createUserWithEmailAndPassword(document.forms["myForm"].email.value, document.forms["myForm"].password.value)
                .then(function () {
                    
                    DB.collection("users").add({
                        fullName: document.forms["myForm"].firstName.value,
                        login: document.forms["myForm"].email.value,
                        password: document.forms["myForm"].password.value,
                        avatar: pig.urlIMG,
                        coin: 1000,
                        gender: document.forms["myForm"].gender.value,
                        pigs: [
                            { weight: 10, hungryLevel: 100, sort: "lower", buyDate:{seconds:Math.round((new Date().getTime()/1000))},healty: 100, price: 100 },
                            { weight: 10, hungryLevel: 100, sort: "lower", buyDate:{seconds:Math.round((new Date().getTime()/1000))},healty: 100, price: 100 },
                            { weight: 10, hungryLevel: 100, sort: "lower", buyDate:{seconds:Math.round((new Date().getTime()/1000))},healty: 100, price: 100 },
                            { weight: 10, hungryLevel: 100, sort: "lower", buyDate:{seconds:Math.round((new Date().getTime()/1000))},healty: 100, price: 100 },
                            { weight: 10, hungryLevel: 100, sort: "lower", buyDate:{seconds:Math.round((new Date().getTime()/1000))},healty: 100, price: 100 },
                        ]
                    })
                    
                    console.log("User is registered")
                    pig.__isLogined(DB);
                })
                .catch(function (error) {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    // [START_EXCLUDE]
                    if (errorCode == 'auth/weak-password') {
                        alert('The password is too weak.');
                    } else {
                        alert(errorMessage);
                    }
                    console.log(error);
                    // [END_EXCLUDE]
                }).then(() => {
                    document.querySelector('#createUser').reset();
                    document.querySelector('.avatarWrap img').setAttribute('src', "")
                });
            e.preventDefault();
        };
    },
    __signIn: (DB) => {
        document.querySelector('#signIn').onsubmit = (e) => {
            firebase.auth().signInWithEmailAndPassword(document.forms["signInForm"].login.value, document.forms["signInForm"].password.value)
            .then(function () {
                    alert("user is sign in")
                    pig.__showFarm(pig.db);
                    pig.__isLogined(DB)
                    document.querySelector('.loginReg').style.display = "none";
                })
                .catch(function (error) {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    // [START_EXCLUDE]
                    if (errorCode === 'auth/wrong-password') {
                        alert('Wrong password.');
                    } else {
                        alert(errorMessage);
                    }
                    console.log(error);
                })
            e.preventDefault();
        }
        // 
    },

}
var root = document.querySelector('#root'),
    pig = new Pig(root);
