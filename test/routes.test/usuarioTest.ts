let _chai = require('chai');
let chaiHttp = require('chai-http');
const expect = require('chai').expect;
const app = require("../../routes/usuario");

_chai.use(chaiHttp);
const url= 'http://localhost:3000';

describe('Obtener prueba: ',()=>{

	it('Obtener prueba', (done) => {
		_chai.request(url)
			.get('/user/prueba')
			.end( function(err: any,res: { body: any; }){
				console.log(res.body)
				expect(res).to.have.status(200);
				done();
			});
	});

});