const CONFIG_API = {
    url: "https://srv.petiteweb.dev/api/2/kmenschikov2120",
    headers: {
        "Content-type": "application/json",
    },
};

const container = document.querySelector("#cont");
const popupBlock = document.querySelector(".popup-wrapper");
const popupAdd = popupBlock.querySelector(".popup-add");
const popupUpd = popupBlock.querySelector(".popup-upd");
const addForm = document.forms.addForm;
const updForm = document.forms.updForm;
let cats;


localStorage.setItem("catUser", "kmenschikov2120")

popupBlock.querySelectorAll(".popup__close").forEach(function(btn) {
	btn.addEventListener("click", function() {
		popupBlock.classList.remove("active");
		btn.parentElement.classList.remove("active");
		if (btn.parentElement.classList.contains("popup-upd")) {
			updForm.dataset.id = "";
		}
	});
});

// ----- привязка события на кнопку
document.querySelector("#add").addEventListener("click", function(e) {
	e.preventDefault();
	popupBlock.classList.add("active");
	popupAdd.classList.add("active");
});

// ----- отображение информации о коте
const showForm = function(data) {
	for (let i = 0; i < updForm.elements.length; i++) {
		let el = updForm.elements[i];
		if (el.name) {
			if (el.type !== "checkbox") {
				el.value = data[el.name] ? data[el.name] : "";
			} else {
				el.checked = data[el.name];
			}
		}
	}
}

// ----- функция удаления кота
const deleteCat = async function(id, tag) {
	let res = await fetch(`${CONFIG_API.url}/delete/${id}`, {
		method: "DELETE"
	});
	let data = await res.json();
	if (data.message === "ok") {
		tag.remove();
        cats = cats.filter(el => +el.id !== +id);
        localStorage.setItem("catArr", JSON.stringify(cats));
	}
}

// ----- создание одиночной карточки
const createCard = function(cat, parent) {

	const card=document.createElement("div");
	card.dataset.id = cat.id;
	card.className="my-1 px-1 w-full md:w-1/2 lg:my-4 lg:px-4 lg:w-1/3";

	const artcl=document.createElement("article");
	artcl.className="overflow-hidden rounded-lg shadow-lg bg-grey-100 dark:bg-slate-500";


	const img = document.createElement("img");

	img.className="block h-auto w-full";
	if (cat.img_link) {
		img.src=`${cat.img_link}`;
	} else {
		img.src="./img/logo.png";
	}
	
	const name = document.createElement("h3");
	name.className="text-2xl font-extrabold";
	name.innerText = cat.name;


	const del = document.createElement("button");
	del.className="basis-1/2 m-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800";
	del.innerText = "Удалить";
	del.id = cat.id;
	del.addEventListener("click", function(e) {
		let id = e.target.id;
		deleteCat(id, card);
	});

	const upd = document.createElement("button");
	upd.className="basis-1/2 m-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800";
	upd.innerText = "Обновить";
	upd.addEventListener("click", function(e) {
		popupUpd.classList.add("active");
		popupBlock.classList.add("active");
		showForm(cat);
		updForm.setAttribute("data-id", cat.id);
	})

	const footer = document.createElement("footer");
	footer.className="p-2 md:p-4";

	const btngrp = document.createElement("div");
	btngrp.className="flex flex-row";
	btngrp.append(del, upd);

	footer.append(name, btngrp);
	artcl.append(img, footer);
	card.append(artcl);
	parent.append(card);
}

// ----- создание галереи котов
const setCards = function(arr) {
    container.innerHTML = "";
    arr.forEach(function(el) {
        createCard(el, container);
    })
}

// ----- функция добавления кота в БД
const addCat = function(cat) {
	fetch(`${CONFIG_API.url}/add`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(cat)
	})
		.then(res => res.json())
		.then(data => {
			if (data.message === "ok") {
				createCard(cat, container);
                cats.push(cat);
                localStorage.setItem("catArr", JSON.stringify(cats))
				addForm.reset();
				popupBlock.classList.remove("active");
			}
		})
}

// ----- функция обновления информации о коте
const updCat = async function(obj, id) {
	let res = await fetch(`${CONFIG_API.url}/update/${id}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(obj)
	})
	let answer = await res.json();
	if (answer.message === "ok") {
        cats = cats.map(el => {
            if (+el.id === +id) {
                return {...el, ...obj};
            } else {
                return el;
            }
        });
        localStorage.setItem("catArr", JSON.stringify(cats));
        setCards(cats);
		updForm.reset();
		updForm.dataset.id = "";
		popupUpd.classList.remove("active");
		popupBlock.classList.remove("active");
	}
}

// ----- получаем список всех котов при загрузке страницы
cats = localStorage.getItem("catArr"); // "[{},{}]"
if (cats) {
    cats = JSON.parse(cats); // [{}, {}]
    setCards(cats);
} else {
	console.log(`${CONFIG_API.url}/show`)
    fetch(`${CONFIG_API.url}/show`)
	.then(res => res.json())
	.then(result => {
		if (result.message === "ok") {
            cats = result.data;
            localStorage.setItem("catArr", JSON.stringify(cats));
			setCards(cats);
		}
	});
}

// ----- привязка события формы при добавлении кота
addForm.addEventListener("submit", function(e) {
	e.preventDefault();
	let body = {}; 
	for (let i = 0; i < addForm.elements.length; i++) {
		let el = addForm.elements[i];
		if (el.name) {
			body[el.name] = el.name === "favourite" ? el.checked : el.value;
		}
	}
	addCat(body);
});

// ----- привязка события формы при обновлении данных о коте
updForm.addEventListener("submit", function(e) {
	e.preventDefault();
	let body = {}; 
	for (let i = 0; i < this.elements.length; i++) {
		let el = this.elements[i];
		if (el.name) {
			body[el.name] = el.name === "favourite" ? el.checked : el.value;
		}
	}
	delete body.id;
	updCat(body, updForm.dataset.id);
});

