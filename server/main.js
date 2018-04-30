import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

Meteor.startup(function() {

	Meteor.methods({
		
		addDS(name, source, type){
			if(!Meteor.userId()) return;
			if(DataSets.findOne({name: name})) return;
			DataSets.insert({
				name: name,
				source: source,
				type: type,
				images: []
			});
		},
		
		addImgToDS(name, image){
			if(!Meteor.userId()) return;
			var ds = DataSets.findOne({name: name});
			if(ds.images.indexOf(image) !== -1) return;
			ds.images.push(image);
			DataSets.update(ds._id, {$set: {images: ds.images}});
		},
		
		removeImageFromDS(name, image){
			if(!Meteor.userId()) return;
			var ds = DataSets.findOne({name: name});
			var index = ds.images.indexOf(image)
			if(index === -1) return;
			ds.images.splice(index, 1);
			DataSets.update(ds._id, {$set: {images: ds.images}});
		},
		
		deleteDS(name){
			if(!Meteor.userId()) return;
			var id = DataSets.findOne({name: name})._id;
			DataSets.remove(id);
		},
		
		addImg(imgID, clat, clong, alt, slat, slong, cloudID, month, metadata, imageID){ //TODO: Images
			if(!Meteor.userId()) return;
			if(ImageData.findOne({id: imgID})) return;
			ImageData.insert({
				id : imgID,
				clat : clat,
				clong : clong,
				alt : alt,
				slat : slat,
				slong : slong,
				cloudID : cloudID,
				month : month,
				metadata : metadata,
				image : imageID
			});
		},
		
		deleteImg(imgId){
			if(!Meteor.userId()) return;
			var id = ImageData.findOne({id: imgId})._id;
			ImageData.remove(id);
		}
		
	});
});

