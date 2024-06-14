import { Component } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon, IonButtons, IonList, IonItem, IonLabel, IonItemSliding, IonItemOptions, IonItemOption } from '@ionic/angular/standalone';
import { Task } from './task';
import { initializeApp } from "firebase/app";
import { DocumentData, CollectionReference, collection, getDocs, getFirestore } from "firebase/firestore/lite";
import { getDatabase, onValue, ref, push, set, remove, onChildAdded, onChildChanged, onChildRemoved } from "firebase/database";
import { Title } from '@angular/platform-browser';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBaVvnInCFoIjCsqa1C-5HgeXpJD3opeyY",
  authDomain: "ionictwodoesteban.firebaseapp.com",
  databaseURL: "https://ionictwodoesteban-default-rtdb.firebaseio.com",
  projectId: "ionictwodoesteban",
  storageBucket: "ionictwodoesteban.appspot.com",
  messagingSenderId: "259974260212",
  appId: "1:259974260212:web:b6e98cb0626727888445a1"
};

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [NgClass, IonItemOption, IonItemOptions, IonItemSliding, NgFor, IonLabel, IonItem, IonList, IonButtons, IonIcon, IonButton, IonHeader, IonToolbar, IonTitle, IonContent],
})
export class HomePage {

  taskList;
  tasks: Array<Task> = [];
  app = initializeApp(firebaseConfig);
  db = getDatabase(this.app);

  constructor() {
    this.taskList = ref(this.db, 'tasks');

    onChildAdded(this.taskList, (data) => {
      this.tasks.push( { id: data.key, title: data.val().title, status: data.val().status } );
    });

    onChildChanged(this.taskList, (data) => {
      const updatedTask = { id: data.key, title: data.val().title, status: data.val().status };
      let index = this.tasks.findIndex(task => task.id === data.key);
      if (index > -1) {
        this.tasks[index] = updatedTask;
      }
    });

    onChildRemoved(this.taskList, (data) => {
      let index = this.tasks.findIndex(task => task.id === data.key);
      if (index > -1) {
        this.tasks.splice(index, 1);
      }
    });

    onValue(this.taskList, (data) => {
      const misdatos = data.val();
      console.log(misdatos);
      console.log(JSON.stringify(misdatos));
      if (typeof(misdatos) != 'undefined') {
        misdatos.forEach( (element: Task) => {
          this.tasks.push( { id: element.id, title: element.title, status: element.status } );
        })
      }
    });
  }

  async getTasks(taskCol: CollectionReference) {
    const taskSnapshot = await getDocs(taskCol);
    const tasksData: DocumentData[] = taskSnapshot.docs.map( doc => doc.data() );
    tasksData.forEach(data => {
      console.log(data);
    });
  }

  addItem() {
    let theNewTask: string|null;
    theNewTask = prompt("New Task", '');
    if (theNewTask !== '' && theNewTask != null) {
      const taskCol = ref(this.db, 'tasks');
      const newTask = push(taskCol);
      set(newTask, {
        id: newTask.key,
        title: theNewTask,
        status: 'open'
      });
    }
  }

  trackItems(index: number, itemObject: any) {
    return itemObject.title;
  }

  markAsDone(itemSliding: IonItemSliding, task: Task) {
    task.status = 'done';
    setTimeout( () => { itemSliding.close() }, 1 );
  }

  removeTask(itemSliding: IonItemSliding, task: Task) {
    let index = this.tasks.indexOf(task);
    if (index > -1) {
      this.tasks.splice(index, 1);
    }
    setTimeout( () => { itemSliding.close() }, 1 );
  }

}
