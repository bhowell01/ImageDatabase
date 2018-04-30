import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

DataSets = new Mongo.Collection("datasets");
Images = new FS.Collection("images", {
  stores: [new FS.Store.GridFS("images")]
});
ImageData = new Mongo.Collection("imageData");

DataSets.allow({
  insert() { return false; },
  update() { return false; },
  remove() { return false; }
});

DataSets.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});

Images.allow({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
  download() {return true; }
});

Images.deny({
  insert() { return false; },
  update() { return false; },
  remove() { return false; }
});

ImageData.allow({
  insert() { return false; },
  update() { return false; },
  remove() { return false; }
});

ImageData.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; }
});