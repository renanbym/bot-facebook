const data = require('./questions');

let info = data.questions.filter( (c) =>  !c.ref_payload  )[0];

let selected = "#0_1_inscricao";

let info2 = data.questions.filter( (c)=> c.ref_payload == selected )[0];

let selected2 = "#0_1_1_como_me_inscrevo";

let info3 = data.questions.filter( (c)=> c.ref_payload == selected2 )[0];

if( typeof info3 == "undefined" ){

    let answer = data.answers.filter( (c) =>  c.selected2  )[0];

    if( typeof answer == "undefined" ){



    }else{
        console.log(answer);
    }


}else{
    console.log(info3);
}


checkQuestion( payload ) => {

    let question = data.questions.filter( (c)=> c.ref_payload == payload )[0];
    if( typeof question == "undefined" ){

        let answer = data.answers.filter( (c) =>  c.selected2  )[0];
        if( typeof answer == "undefined" ){

            var final = data.questions.filter( (c)=> c.ref_payload == "final" )[0];
            callback( false, final );

        }else{
            callback( false, answer );
        }

    }else{
        callback( false, question );
    }

}
