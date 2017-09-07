
const questions = [
    {
        question: "Sobre o que você que saber ?"
        ,answers: [
            {"title": "Inscrições", "payload": "#0_1_inscricao"}
            ,{"title": "O desafio", "payload": "#0_2_desafio"}
        ]
        ,ref_payload: false
    }
    ,{
        question: "Inscrição"
        ,answers:[
            { "title": "Como me inscrevo", "payload": "#0_1_1_como_me_inscrevo" }
            ,{ "title": "Posso participar sozinho", "payload": "#0_1_2_posso_participar_sozinho" }
            ,{ "title": "Existe limite de pessoas por grupo", "payload": "#0_1_3_existe_limite_de_pessoas_por_grupo" }
        ]
        ,ref_payload: "#0_1_inscricao"
    }
    ,{
        question: "O Desafio"
        ,answers:[
            { "title": "Sobre o Mentor", "payload": "#0_2_1_sobre_o_mentor" }
            ,{ "title": "Sobre o Desafio", "payload": "#0_2_2_sobre_o_desafio" }
        ]
        ,ref_payload: "#0_2_desafio"
    }
]

const textAnswers = [
    {
        ref: "#0_1_1_como_me_inscrevo"
        ,type: "text"
        ,text: "As inscrições do Desafio começaram em 25/08 ..."
        ,ref_faq: 1
    }
    ,{
        ref: "#0_1_2_posso_participar_sozinho"
        ,type: "text"
        ,text: "As inscrições do Desafio começaram em 25/08 ..."
        ,ref_faq: 2
    }
    ,{
        ref: "#0_1_3_existe_limite_de_pessoas_por_grupo"
        ,type: "text"
        ,text: "As inscrições do Desafio começaram em 25/08 ..."
        ,ref_faq: 3
    }
]

module.exports = {questions: questions, answers: textAnswers }
