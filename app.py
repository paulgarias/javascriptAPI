import pandas as pd
import json

from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func, inspect

from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)

from flask_restful import Resource, Api

app = Flask(__name__)
api = Api(app)

engine = create_engine("sqlite:///DataSets/belly_button_biodiversity.sqlite")

@app.route('/')
def index():
	return render_template("index.html")

@app.route('/names')
def sample_names():
	""" List of sample names. 
		Returns list of sample names in the format 
		[ "BB_940",...]   
	"""
	inspector = inspect(engine)
	columns = inspector.get_columns('samples')
	names = [item['name'] for item in columns][1:]
	return jsonify(names)

@app.route('/otu')
def sample_otu():
	"""List of OTU descriptions.
	
	Returns a list of OTU descriptions in the following format
	
	[
	    "Archaea;Euryarchaeota;Halobacteria;Halobacteriales;Halobacteriaceae;Halococcus",
	    "Archaea;Euryarchaeota;Halobacteria;Halobacteriales;Halobacteriaceae;Halococcus",
	    "Bacteria",
	    "Bacteria",
	    "Bacteria",
	    ...
	]
	"""
	data = engine.execute("select * from otu")
	otu = [item[1] for item in data]
	return jsonify(otu)

class MetaDataSample(Resource):
	def get(self,sampleID):
		"""MetaData for a given sample.
		
		Args: Sample in the format: `BB_940`
		
		Returns a json dictionary of sample metadata in the format
		
		{
		    AGE: 24,
		    BBTYPE: "I",
		    ETHNICITY: "Caucasian",
		    GENDER: "F",
		    LOCATION: "Beaufort/NC",
		    SAMPLEID: 940
		}
		"""
		Base = automap_base()
		Base.prepare(engine,reflect=True)
		SamplesMeta = Base.classes['samples_metadata']
		session = Session(bind=engine)
		sample_metadata = session.query(SamplesMeta).filter(SamplesMeta.SAMPLEID==sampleID[3:])
		try:
			sm, = sample_metadata.all()	
			returnSample = {
			 "AGE":         sm.AGE,
			 "BBTYPE":      sm.BBTYPE,
			 "ETHNICITY":   sm.ETHNICITY,
			 "GENDER":      sm.GENDER,
			 "LOCATION":    sm.LOCATION,
			 "SAMPLEID":	sm.SAMPLEID	
			}
		except:
			returnSample = {
				"Response":"No Data"
			}
		return jsonify(returnSample)

class MetaDataWFREQ(Resource):
	def get(self,sampleID):
		"""Weekly Washing Frequency as a number.
		Args: Sample in the format: `BB_940`
		Returns an integer value for the weekly washing frequency `WFREQ`
		"""
		Base = automap_base()
		Base.prepare(engine,reflect=True)
		SamplesMeta = Base.classes['samples_metadata']
		session = Session(bind=engine)
		sample_metadata = session.query(SamplesMeta).filter(SamplesMeta.SAMPLEID==sampleID[3:])
		try:
			sm, = sample_metadata.all()
			return sm.WFREQ
		except:
			return ""

api.add_resource(MetaDataSample,'/metadata/<string:sampleID>')
api.add_resource(MetaDataWFREQ,'/wfreq/<string:sampleID>')

if __name__== "__main__":
	app.run(debug=True)
