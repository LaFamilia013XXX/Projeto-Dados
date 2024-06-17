// variáveis de import -->
const puppeteer = require('puppeteer-extra');
const fs = require('fs');
const { json } = require('agent-base');
const { error } = require('console');

const StealthPlugin = require('puppeteer-extra-plugin-stealth') 
puppeteer.use(StealthPlugin()); 

// fim variáveis de import <--

// variáveis de controle -->

let timer;
let segundos = 0;
let mineradorStatus = false;
const dados = [];
const info = [];
let regexNumber = /^[-+]?\d*\.?\d+$/;

// fim variáveis de controle <--

// seletores -->

const contadorEmails = document.querySelector('.count-emails');
const url = document.querySelector('#input-url');
const initalPage = document.querySelector('#input-initialNumber');
const endPage = document.querySelector('#input-endNumber');
const pageRestantes = document.querySelector('.pg-restantes');
const pageFinal = document.querySelector('.pg-end');
const time = document.querySelector('.class-time');
const iniciar = document.querySelector('.run-url');
const finalizarSessao = document.querySelector('.finalizar-section');

// fim seletores <--

iniciar.addEventListener('click', (e) => {
    e.preventDefault();

    let valor1 = Number(endPage.value);
    let valor2 = Number(initalPage.value);

    const validandoNumero = regexNumber.test(initalPage.value);
    const validandoNumero2 = regexNumber.test(endPage.value);
    const validandoValores = valor1 >= valor2;
    const validandoURL = url.value.includes('https://basecnpj.com.br/resultado?page');

    // condição que verifica se os campos necessários estão preenchidos
    if(!url.value || !initalPage.value || !endPage.value || !validandoNumero || !validandoNumero2 || !validandoValores || !validandoURL){
        if(url.value || validandoURL) url.classList.remove('class-input-false');
        if(initalPage.value || validandoNumero || validandoValores) initalPage.classList.remove('class-input-false');
        if(endPage.value || validandoNumero2 || validandoValores) endPage.classList.remove('class-input-false');
        if(!url.value || !validandoURL) url.classList.add('class-input-false');
        if(!initalPage.value || !validandoNumero || !validandoValores) initalPage.classList.add('class-input-false');
        if(!endPage.value || !validandoNumero2 || !validandoValores) endPage.classList.add('class-input-false');
    }

    if(url.value && initalPage.value && endPage.value && !mineradorStatus && validandoNumero && validandoNumero2 && validandoValores && validandoURL){
        time.innerHTML = '00:00:00';
        segundos = 0;

        iniciaRelogio();

        mineradorStatus = true;

        var urlFormatada = transformandoURL(url.value);

        (async () => {
            url.classList.remove('class-input-false');
            initalPage.classList.remove('class-input-false');
            endPage.classList.remove('class-input-false');

            // Launch the browser and open a new blank page
            const browser = await puppeteer.launch({headless: false});
            const page = await browser.newPage();
            pageFinal.innerHTML = endPage.value;
        
            // Navigate the page to a URL
            
            for(var k=valor2; k<=valor1; k++){
                pageRestantes.innerHTML = k;
                await page.goto(urlFormatada.replace('page=2', `page=${k}`), {timeout: 0});
                const enderecos = await page.evaluate(() => {

                        const selectorA = document.querySelectorAll('a')
        
                        const arrayHref = [];
                        const link = [];
        
                        for(let i=0; i<selectorA.length; i++){
                            arrayHref.push(selectorA[i].getAttribute('href'))
                        }
        
                        for(let i=0; i<selectorA.length; i++){
                            if(selectorA[i].getAttribute('href').includes('/empresa/')){
                                link.push(selectorA[i].getAttribute('href')) 
                            }
                        }
                        return link
                        }    
                    )
        
                dados.push(enderecos);
        
                for(let i=0; i<10; i++){
                    await page.goto(`https://basecnpj.com.br/${enderecos[i]}`, {timeout: 0});
        
                    const dadosFull = await page.evaluate(() => {
                        // Variáveis que irão armazenar os dados;
                        var nome, email, numero, cnae, nomeFantasia, razaoSocial;

                        const selectorSpan = document.querySelectorAll('span');
                        const dados = [];

                        // funções dentro do DOOM -->

                        function validandoNumber(numero){
                            var validandoNumberk = /\(?\d{2}\)?\s?9\s?\d{4}-?\d{4}/
                            return validandoNumberk.test(numero);
                        }
                        function validandoNumber2(numero){
                            var validandoNumber2k = /\(?\d{2}\)?\s?\d{4}-?\d{4}/    
                            return validandoNumber2k.test(numero);
                        }
                        function objDado(nome, razaoSocial, emails, numero, nomeFantasia, cnae){
                            return {
                                Nome: nome,
                                RazaoSocial: razaoSocial,
                                numero: numero,
                                Email: emails,
                                NomeFantasia: nomeFantasia,
                                Cnae:cnae,
                            }
                        }

                        // FIM funções DOOM <--

                        // Seletores que pegam as informações atraves das Tags -->

                        for(let i=0; i<selectorSpan.length; i++){
                            let verificandoContabilidade = selectorSpan[i].innerText.includes('contabilidade');
                            let verificandoContabilidade2 = selectorSpan[i].innerText.includes('contabil');
                            let verificandoArroba = selectorSpan[i].innerText.includes('@') 
                            if(verificandoArroba && !verificandoContabilidade && !verificandoContabilidade2) email = selectorSpan[i].innerText
                        }
                            
                            for(let i=0; i<selectorSpan.length; i++){
                                if(validandoNumber(selectorSpan[i].innerText) || validandoNumber2(selectorSpan[i].innerText)){
                                    numero = selectorSpan[i].innerText
                                }
                            }
                            
                            for(let i=0; i<selectorSpan.length; i++){
                            
                                if(selectorSpan[i].innerText === 'RAZÃO SOCIAL:' || selectorSpan[i].innerText === 'NOME FANTASIA:' || selectorSpan[i].innerText === 'CNAE PRINCIPAL:'){
                            
                                    if(selectorSpan[i].innerText === 'RAZÃO SOCIAL:'){
                                        razaoSocial = selectorSpan[i+1].innerText;
                                    }
                                    if(selectorSpan[i].innerText === 'NOME FANTASIA:'){
                                        nomeFantasia = selectorSpan[i+1].innerText;
                                    }
                                    if(selectorSpan[i].innerText === 'CNAE PRINCIPAL:'){
                                        cnae = selectorSpan[i+1].innerText;
                                    }       
                                }
                            }
                            
                            const title = document.querySelector('h2');
                            nome = title.innerText;

                            // FIM Seletores <--

                            let objEmpresa = objDado(nome, razaoSocial, email, numero, nomeFantasia, cnae);

                            // Armazenando dados no array

                            dados.push(objEmpresa);

                            return dados;

                    })
        
                    info.push(dadosFull);

                    contadorEmails.innerHTML = info.length 
                }
                
                fs.writeFile('baseEmail.json', JSON.stringify(info, null, 2), err => {
                    if(err) throw new Error('Aplicação com erro');
                });
            }
            
            clearInterval(timer);
            await browser.close();

        })();
    }
    
})

finalizarSessao.addEventListener('click', (e) => {
    e.preventDefault();
    url.classList.remove('class-input-false');
    initalPage.classList.remove('class-input-false');
    endPage.classList.remove('class-input-false');
    mineradorStatus = false;
    url.value = '';
    initalPage.value = '';
    endPage.value = '';
    pageFinal.innerHTML = '0';
    pageRestantes.innerHTML = '0';
    verificandoValor = false;
    time.innerHTML = '00:00:00';
    clearInterval(timer);
    segundos = 0;
})

// funções do sistema -->

function criandooData(segundo){
    const datando = new Date(1000 * segundo);
    return datando.toLocaleTimeString('pt-br', {
        timeZone: 'GMT'
    });
}

function iniciaRelogio(){
    timer = setInterval(function(){
        segundos++
        time.innerHTML = criandooData(segundos);
    }, 1000);
}

function transformandoURL(url){
    let transformando = url;
    transformando = transformando.split('');
    transformando.splice(34, 6, `page=2`);
    transformando = transformando.join('');

    return transformando;
}

// fim funções do sistema <--