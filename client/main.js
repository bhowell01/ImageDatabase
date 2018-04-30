/**************************************************************************************************

Images Database
LetSat
Brian Howell 4/18/18

**************************************************************************************************/

import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Mongo } from 'meteor/mongo';
import { Session } from 'meteor/session'

import './main.html';

Session.setDefault('addingDS', false);
Session.setDefault('selectedSet', null);
Session.setDefault('selectedImage', null);
Session.setDefault('viewingSet', false);
Session.setDefault('addingImg', false);
	
Template.body.helpers({
	signedIn(){ return Meteor.userId() === null ? false : true }
});

Template.signIn.events({
	'click #signButton': function(e){
		e.preventDefault();
		var user = document.getElementById('uname').value
		var pass = document.getElementById('pword').value
		Meteor.loginWithPassword(user, pass)
	}
});

Template.mainPage.helpers({
	DSettings: function(){
		return {
			collection: DataSets,
			rowsPerPage: 30,
			showFilter: true,
			showNavigation: 'auto',
			fields: [
				{ key: 'name', label: 'Name' },
				{ key: 'source', label: 'Source' },
				{ key: 'type', label: 'Type' }
			],
			useFontAwesome: true,
			group: 'client'
		}
	},
	
	IMSettings: function(){
		return {
			collection: ImageData.find({id: {$in:DataSets.findOne({name:Session.get('selectedSet')}).images}}),
			rowsPerPage: 50,
			showFilter: true,
			showNavigation: 'auto',
			fields: [
				{ key: 'id', label: 'ID' },
				{ key: 'clat', label: 'Center Lat' },
				{ key: 'clong', label: 'Center Long' },
				{ key: 'alt', label: 'Alt' },
				{ key: 'slat', label: 'Sun Lat' },
				{ key: 'slong', label: 'Sun Long' },
				{ key: 'month', label: 'Month' },
				{ key: 'cloudID', label: 'Cloud ID' }
			],
			useFontAwesome: true,
			group: 'client'
		}
	},
	
	addingSet(){
		return Session.get('addingDS');
	},
	
	selectedSet(){
		return Session.get('selectedSet');
	},
	
	viewingSet(){
		return Session.get('viewingSet');
	},
	
	addingImg(){
		return Session.get('addingImg');
	},
	
	selectedImage(){
		return Session.get('selectedImage');
	},
	
	specificImage(){
		var imageData = ImageData.findOne({id: Session.get('selectedImage')});
		return Images.find({_id: imageData.image});
	},
	
	dlLink(){
		var imageData = ImageData.findOne({id: Session.get('selectedImage')});
		return Images.findOne({_id: imageData.image}).url();
	}
});

Template.mainPage.events({
	'click #addDS': function(e){
		e.preventDefault();
		var adding = Session.get('addingDS');
		Session.set('addingDS', !adding);
	},
	
	'click #confirmAddDS': function(e){
		e.preventDefault();
		var name = document.getElementById('dsName').value;
		var source = document.getElementById('dsSource').value;
		var type = document.getElementById('dsType').value;
		
		if(name === '' || source === '' || type === '') {
			alert('All fields are required!');
			return;
		}
		
		document.getElementById('dsName').value = '';
		document.getElementById('dsSource').value = '';
		document.getElementById('dsType').value = '';
		
		Meteor.call('addDS', name, source, type);
	},
	
	'click #viewDS': function(e){
		e.preventDefault();
		Session.set('viewingSet', !Session.get('viewingSet'));
	},
	
	'click #deleteDS': function(e){
		e.preventDefault();
		if(confirm('Are you sure you want to delete this dataset and all associated images?')){
			var imageIds = DataSets.findOne({name: Session.get('selectedSet')}).images;
			for(var i=0;i<imageIds.length;i++){
				var img = ImageData.findOne({id: imageIds[i]});
				Images.remove(img.image);
				Meteor.call('deleteImg', img.id);
			}
			Meteor.call('deleteDS', Session.get('selectedSet'));
			Session.set('viewingSet', false);
			Session.set('selectedSet', null);
		}
	},
	
	'click #addImg': function(e){
		e.preventDefault();
		Session.set('addingImg', !Session.get('addingImg'));
	},
	
	'click #confirmAddImg': function(e){
		e.preventDefault();
		
		var id = document.getElementById('imgId').value;
		var clat = document.getElementById('imgClat').value;
		var clong = document.getElementById('imgClong').value;
		var alt = document.getElementById('imgAlt').value;
		var slat = document.getElementById('imgSlat').value;
		var slong = document.getElementById('imgSlong').value;
		var month = document.getElementById('imgMonth').value;
		var cloudID = document.getElementById('imgCloudID').value;
		var metadata = document.getElementById('imgMetadata').value;
		var image = document.getElementById('imgImage').files[0];
		
		if(!image) {
			alert('Please upload an image!');
			return;
		}
		
		if(id === '' || clat === '' || clong === '' || alt === '' || slat === '' || slong === '' || month === '' || cloudID === ''){
			alert('All fields besides metadata are required.');
			return;
		}
		
		document.getElementById('imgId').value = '';
		document.getElementById('imgClat').value = '';
		document.getElementById('imgClong').value = '';
		document.getElementById('imgAlt').value = '';
		document.getElementById('imgSlat').value = '';
		document.getElementById('imgSlong').value = '';
		document.getElementById('imgMonth').value = '';
		document.getElementById('imgCloudID').value = '';
		document.getElementById('imgMetadata').value = '';
		document.getElementById('imgImage').value = '';
		document.getElementById('imgImage').files[0] = null;
		
		var image = Images.insert(new FS.File(image));
		
		Meteor.call('addImgToDS', Session.get('selectedSet'), id);
		Meteor.call('addImg', id, clat, clong, alt, slat, slong, cloudID, month, metadata, image._id);
	},
	
	'click #deleteImg': function(e){
		e.preventDefault();
		var imageData = ImageData.findOne({id: Session.get('selectedImage')});
		Images.remove(imageData.image);
		Meteor.call('deleteImg', imageData.id);
		Meteor.call('removeImageFromDS', Session.get('selectedSet'), imageData.id);
	},
	
	'click .reactive-table tbody tr': function (e) {
		e.preventDefault();
		var selectedSet = Session.get('selectedSet');
		var selectedImg = Session.get('selectedImage');
		var selectedRow = e.target.parentElement
		var name = selectedRow.children[0].textContent;
		if(!selectedSet){
			selectedRow.classList.add('selectedRow');
			Session.set('selectedSet', name);
			return;
		}
		if(DataSets.findOne({name: name})){ //if the row is in the DataSet table
			if(selectedSet != name) {
				var rows = selectedRow.parentElement.children;
				for(var i=0;i<rows.length;i++){
					var classes = rows[i].classList;
					classes.length = 0;
					classes.value = '';
					rows[i].className = '';
				}
				selectedRow.classList.add('selectedRow');
				Session.set('selectedSet', name);
				Session.set('selectedImage', null);
			} else {
				var classes = selectedRow.classList;
				classes.length = 0;
				classes.value = '';
				selectedRow.className = '';
				Session.set('selectedSet', null);
				Session.set('selectedImage', null);
				Session.set('viewingSet', false);
			}
			return;
		}
		//if the row is in the images table
		if(selectedImg != name) {
			var rows = selectedRow.parentElement.children;
			for(var i=0;i<rows.length;i++){
				var classes = rows[i].classList;
				classes.length = 0;
				classes.value = '';
				rows[i].className = '';
			}
			selectedRow.classList.add('selectedRow');
			Session.set('selectedImage', name);
		} else {
			var classes = selectedRow.classList;
			classes.length = 0;
			classes.value = '';
			selectedRow.className = '';
			Session.set('selectedImage', null);
		}
	}
	
});
























