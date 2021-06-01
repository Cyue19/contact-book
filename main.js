class Contact {
    constructor(name, email, phoneNumber) {
        this.name = name;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.id = UUID.generate();
        this.deleteId = this.id + "-D";
        this.editId = this.id + "-E";
    }

    addToBook(tableBody) {
        const row = document.createElement("tr");
        row.setAttribute("id", this.id);
        
        row.innerHTML = `
            <td>${this.name}</td>
            <td>${this.email}</td>
            <td>${this.phoneNumber}</td>
            <td><button id="${this.deleteId}" class="btn btn-danger">Remove</button></td>
            <td><button id="${this.editId}" class="btn btn-secondary">Edit</button></td>
        `;

        tableBody.append(row);
    }

    delete() {
        const row = document.getElementById(this.id);
        row.remove();
    }

    edit() {
        const row = document.getElementById(this.id);
        const cells = row.children;
        const ui = new UI();

        row.innerHTML = `
            <td><input id="new-name" type="text" value="${this.name}"></td>
            <td><input id="new-email" type="text" value="${this.email}"></td>
            <td><input id="new-phone" type="text" value="${this.phoneNumber}"></td>
            <td><button id="${this.editId + "-done"}" class="btn btn-secondary">Done</button></td>
        `; 

        document.getElementById(this.editId+"-done").addEventListener("click", () => {
            this.name = document.getElementById("new-name").value;
            this.email = document.getElementById("new-email").value;
            this.phoneNumber = document.getElementById("new-phone").value;
            
            row.innerHTML = `
            <td>${this.name}</td>
            <td>${this.email}</td>
            <td>${this.phoneNumber}</td>
            <td><button id="${this.deleteId}" class="btn btn-danger">Remove</button></td>
            <td><button id="${this.editId}" class="btn btn-secondary">Edit</button></td>
            `;

            ui.initializeRowButtons(this);
            ui.storage.editSavedContact(this);
        });
    }
}

class Storage {
    getContacts() {
        let contacts = [];
        const contactsAsJson = localStorage.getItem("contacts");
        if (contactsAsJson) {
            const contactArr = JSON.parse(contactsAsJson);
            contacts = contactArr.map(x => new Contact(x.name, x.email, x.phoneNumber));
        }

        return contacts;
    }

    saveContact(contact) {
        const contacts = this.getContacts();
        contacts.push(contact);

        localStorage.setItem("contacts", JSON.stringify(contacts));
    }

    removeContactWithPhone(phoneNumber) {
        let contacts = this.getContacts();
        contacts = contacts.filter(contact => contact.phoneNumber != phoneNumber);

        localStorage.setItem("contacts", JSON.stringify(contacts));
    }

    editSavedContact(contact) {
        let contacts = this.getContacts();
        let index;

        for (let i=0; i<contacts.length; i++) {
            if (contacts[i].phoneNumber == contact.phoneNumber) {
                index = i;
            }
        }

        contacts[index].name = contact.name;
        contacts[index].email = contact.email;
        contacts[index].phoneNumber = contact.phoneNumber;

        localStorage.setItem("contacts", JSON.stringify(contacts));
    }
}

class UI {
    constructor() {
        this.nameInput = document.getElementById("name");
        this.emailInput = document.getElementById("email");
        this.phoneNumberInput = document.getElementById("phone-number");
        this.tableBody = document.getElementById("table-body");
        this.storage = new Storage();
    }

    initializeAddListener() {
        const addButton = document.getElementById("add");

        addButton.addEventListener("click", () => {
            const name = this.nameInput.value;
            const email = this.emailInput.value;
            const phoneNumber = this.phoneNumberInput.value;

            const contact = new Contact(name, email, phoneNumber);
            contact.addToBook(this.tableBody);

            this.storage.saveContact(contact);
            this.initializeRowButtons(contact);
            this.clearInputs();
            this.counter++;
        });
    }

    initializeRowButtons(contact) {
        this.initializeDeleteListener(contact);
        this.initializeEditListener(contact);
    }

    initializeDeleteListener(contact) {
        const deleteButton = document.getElementById(contact.deleteId);

        deleteButton.addEventListener("click", () => {
            contact.delete();
            this.storage.removeContactWithPhone(contact.phoneNumber);
        });
    }

    initializeEditListener(contact) {
        const deleteButton = document.getElementById(contact.editId);

        deleteButton.addEventListener("click", () => {
            contact.edit();
        });
    }

    clearInputs() {
        this.nameInput.value = null;
        this.emailInput.value = null;
        this.phoneNumberInput.value = null;
    }

    reloadSavedContacts() {
        const contacts = this.storage.getContacts();

        for (const contact of contacts) {
            contact.addToBook(this.tableBody);
            this.initializeRowButtons(contact);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI();
    ui.initializeAddListener();
    ui.reloadSavedContacts();
  });