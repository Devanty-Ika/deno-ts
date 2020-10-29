import { renderFileToString } from 'https://deno.land/x/dejs/mod.ts';
import {insert, select } from '../model/pg_model.ts';
import TSql from '../model/sql.ts';
import { makeJwt, setExpiration, Jose, Payload } from "https://deno.land/x/djwt/create.ts";
import {dateToString} from 'https://deno.land/x/date_format_deno/mod.ts'

const home = async ({response,state} :{response:any,state:any} ) => {
    let userLoged : string = 'User Tamu' ;
    if((state.currentUser != undefined) && ( state.currentUser != ' ')){
        userLoged = state.currentUser;
    }
    const dataTable = await select(
        [
            {text : TSql ['SkillFindAll']},
            {text : TSql ['BlogInfoFindAll']}
        ]
    )
    const html = await renderFileToString("./template/home.ejs", { 
        data:{
            nama:"Devanty",
            skill :dataTable[0],
            bloginfo:dataTable[1],
            userInfo:userLoged,
        },
        subview:{
            namafile: "./template/blogmain.ejs",
            showjumbotron:true
        }
    });
    response.body=new TextEncoder().encode(html);
}
const signup =async ({response,request,state}:{response:any,request:any,state:any})=>{
    let userLoged : string = 'User Tamu' ;
    if (!request.hasBody){
        let signupError:string='';
        if((state.pesanError!=undefined) && (state.pesanError!='')){
            signupError=state.pesanError;
        }
        const html =await renderFileToString("./template/home.ejs",{
            data:{
                nama:"Devanty",
                skill :await select({
                    text : TSql ['SkillFindInKode'],
                    args: ['php','js','py']
                }),
                bloginfo:await select({
                    text:TSql['BlogInfoFindAll']
                }),
                statusSignup:signupError,
                userInfo:userLoged 
            },
            subview:{
                namafile: "./template/signup.ejs",
                showjumbotron:false
            }
        })
        response.body=new TextEncoder().encode(html);
    } else{
        const body = await request.body().value;
        const parseData = new URLSearchParams(body);
        const namalengkap = parseData.get("fullname");
        const namauser = parseData.get("username");
        const password= parseData.get("password");

        let hasil=await insert({
            text:TSql['InsUser'],
            args:[namauser,namalengkap,password]
        });
        if (hasil[0]=='Sukses'){
            state.pesanError='';
            response.body='Sukses Menyimpan Data. Silahkan lakukan Refresh dan LOG - IN';
        }else{
            state.pesanError=hasil[1];
            response.redirect('/daftar');
        }
    } 
}

const kategori = async({params,response}:{params:{id:string},response:any})=>{
    response.body="ID Parameter " + params.id;
}

const login = async({response,request,state,cookies}:{response:any,request:any,state:any,cookies:any})=>{
    if (!request.hasBody){
        let loginError:string='';
        if((state.statusLogin!=undefined) && (state.statusLogin!='')){
            loginError=state.statusLogin;
        }

        let userLoged : string = 'User Tamu' ;
        if((state.currentUser != undefined) && ( state.currentUser != ' ')){
            userLoged = state.currentUser;
        }

        const html =await renderFileToString("./template/home.ejs",{
            data:{
                nama:"Devanty",
                skill :await select({
                    text : TSql ['SkillFindInKode'],
                    args: ['php','js','py']
                }),
                bloginfo:await select({
                    text:TSql['BlogInfoFindAll']
                }),
                statusLogin:loginError,
                userInfo:userLoged
            },
            subview:{
                namafile: "./template/login.ejs",
                showjumbotron:false
            }
        })
        response.body=new TextEncoder().encode(html);
    }else
    {
        const body = await request.body().value;
        const parseData = new URLSearchParams(body);
        const namauser :string = parseData.get("username")||'';
        const password= parseData.get("password");

        let hasil=await select({
            text:TSql['SelUser'],
            args:[namauser,password]
        });

        if(hasil.length>0){
            const payload: Payload = {
                iss: namauser,
                exp: setExpiration(new Date().getTime()+1000*60*60),
            };
            const header: Jose = {
                alg: "HS256",
                typ: "JWT",
            };

            const jwt = await makeJwt({ header, payload, key: Deno.env.get('JWT_KEY') || ' ' });
            cookies.set("jwt_saya", jwt);

            state.statusLogin='';
            response.redirect('/');
        }else{
            state.statusLogin="Username atau Password anda salah";
            response.redirect('/login');
        }
    }
}

const posting = async ({response,request,state,cookies}:{response:any,request:any,state:any,cookies:any}) =>{
    let userLoged : string = 'User Tamu' ;
    if((state.currentUser != undefined) && ( state.currentUser != ' ')){
        userLoged = state.currentUser;
    }
    if (!request.hasBody){
        let errorPosting :String = ' ';
        if ((state.pesanError != undefined ) && (state.pesanError != ' ')) {
            errorPosting = state.pesanError;
            state.pesanError = ' ';
        };
        let oprDatabase = 'INSERT';
        if ((state.operasi_database!= undefined ) && (state.operasi_database != ' ')) {
            oprDatabase = state.operasi_database;
        };
        const html =await renderFileToString("./template/home.ejs",{
            data:{
                nama:"Devanty",
                skill :await select({
                    text : TSql ['SkillFindInKode'],
                    args: ['php','js','py']
                }),
                bloginfo:await select({
                    text:TSql['BlogInfoFindAll']
                }),
                userInfo:userLoged,
                msgError:errorPosting,
                operasi_database:oprDatabase
            },
            subview:{
                namafile: "./template/posting.ejs",
                showjumbotron:false
            }
        })
        response.body=new TextEncoder().encode(html);
    } else {
        const body = await request.body().value;
        const parseData = new URLSearchParams(body);
        const status_data :string = parseData.get("status_data") || "INSERT"; 
        const judul : any= parseData.get("judul") || null;
        const permalink : any= parseData.get("permalink") || null;
        const permalink_lama : any= parseData.get("permalink_lama") || null;
        const kategori : any= parseData.get("kategori") || null;
        const deskripsi : any= parseData.get("deskripsi") || null;
        const konten : any = parseData.get("konten") || null ;
        const tanggal = dateToString(new Date());

        let hasil : any = [];
        if(status_data=='INSERT'){
            hasil=await insert({
                text:TSql['InsKonten'],
                args:[permalink, judul, kategori, deskripsi, konten, userLoged, tanggal]
            });
        } else if(status_data == 'UPDATE') {
            hasil=await insert({
                text:TSql['UpdKonten'],
                args:[permalink, judul, kategori, deskripsi, konten, tanggal, permalink_lama]
            });
        }

        if (hasil[0]=='Sukses'){
            state.operasi_database = 'UPDATE';
            state.pesanError='';
        }else{
            state.operasi_database = status_data;
            state.pesanError=hasil[1];
        }
        response.redirect('posting');

    }
}

const logout = async ({response,state,cookies}:{response:any,state:any,cookies:any})=>{
    state.currentUser =' ';
    cookies.delete ("jwt_saya");
    response.redirect("/");
}
export { home, signup,kategori,login,logout,posting}