/**
 * @author: Kaustubh, Akshat, Zdenek Vafek
 * Testing if:
 * clicking a dashboard card opens the model/module on Reserach/Teach/Learn
 */




 Cypress.on('uncaught:exception', (err, runnable) => {
	return false
})

context('Researcher changing language', () => {

	const URL = Cypress.env('CC_TEST_URL') ||  'http://localhost:5000/'
  
	const languages = [
		{ lang: 'af', text: 'Gepubliseerde Modelle' }, // Afrikaans
		{ lang: 'sq', text: 'Model i Ri' }, // Albanian
		{ lang: 'am', text: 'አዲስ ሞዴል' }, // Amharic
		{ lang: 'ar', text: 'نموذج جديد' }, // Arabic
		{ lang: 'hy', text: 'Նոր մոդել' }, // Armenian
		{ lang: 'az', text: 'Yeni model' }, // Azerbaijani
		{ lang: 'eu', text: 'Eredu berria' }, // Basque //
		{ lang: 'be', text: 'Новая мадэль' }, // Belarusian
		{ lang: 'bn', text: 'নতুন মডেল' }, // Bengali

		// { lang: 'bs', text: 'Novi Model' }, // Bosnian
		// { lang: 'bg', text: 'Нов Модел' }, // Bulgarian
		// { lang: 'ca', text: 'Model Nou' }, // Catalan
		// { lang: 'ceb', text: 'Bag-Ong Modelo' }, // Cebuano
		// { lang: 'ny', text: 'Chitsanzo Chatsopano' }, // Chichewa
		// { lang: 'zh-cn', text: '新模型' }, // Chinese (Simplified)
		// { lang: 'zh-tw', text: '新模型' }, // Chinese (Traditional)
		// { lang: 'co', text: 'Mudellu Novu' }, // Corsican
		// { lang: 'hr', text: 'Novi Model' }, // Croatian
		// { lang: 'cs', text: 'Nový Model' }, // Czech
		// { lang: 'da', text: 'Ny Model' }, // Danish
		// { lang: 'nl', text: 'Nieuw Model' }, // Dutch
		// { lang: 'en', text: 'New Model' }, // English
		// { lang: 'eo', text: 'Nova Modelo' }, // Esperanto
		// { lang: 'et', text: 'Uus Mudel' }, // Estonian
		// { lang: 'tl', text: 'Bagong Modelo' }, // Filipino (Tagalog)
		// { lang: 'fi', text: 'Uusi Malli' }, // Finnish
		// { lang: 'fr', text: 'Nouveau Modèle' }, // French
		// { lang: 'fy', text: 'Nij Model' }, // Frisian
		// { lang: 'gl', text: 'Novo Modelo' }, // Galician
		// { lang: 'ka', text: 'ახალი მოდელი' }, // Georgian
		// { lang: 'de', text: 'Neues Modell' }, // German
		// { lang: 'el', text: 'Νέο Μοντέλο' }, // Greek
		// { lang: 'gu', text: 'નવું મોડેલ' }, // Gujarati
		// { lang: 'ht', text: 'Nouvo Modèl' }, // Haitian Creole
		// { lang: 'ha', text: 'Sabon Samfur' }, // Hausa
		// { lang: 'haw', text: 'Hoʻohālike Hou' }, // Hawaiian
		// { lang: 'iw', text: 'דגם חדש' }, // Hebrew
		// { lang: 'hi', text: 'नया मॉडल' }, // Hindi
		// { lang: 'hmn', text: 'Qauv Tshiab' }, // Hmong
		// { lang: 'hu', text: 'Új Modell' }, // Hungarian
		// { lang: 'is', text: 'Nýtt Líkan' }, // Icelandic
		// { lang: 'ig', text: 'Nkọwapụta Ohụụ' }, // Igbo
		// { lang: 'id', text: 'Model Baru' }, // Indonesian
		// { lang: 'ga', text: 'Múnla Nua' }, // Irish
		// { lang: 'it', text: 'Nuovo Modello' }, // Italian
		// { lang: 'ja', text: '新しいモデル' }, // Japanese
		// { lang: 'jw', text: 'Model Anyar' }, // Javanese
		// { lang: 'kn', text: 'ಹೊಸ ಮಾದರಿ' }, // Kannada
		// { lang: 'kk', text: 'Жаңа Модель' }, // Kazakh
		// { lang: 'km', text: 'គំរូ ថ្មី' }, // Khmer
		// { lang: 'ko', text: '새 모델' }, // Korean
		// { lang: 'ku', text: 'Modela Nû' }, // Kurdish
		// { lang: 'ky', text: 'Жаңы Модель' }, // Kyrgyz
		// { lang: 'lo', text: 'ແມ່ແບບ ໃໝ່' }, // Lao
		// { lang: 'la', text: 'Novum Exemplum' }, // Latin
		// { lang: 'lv', text: 'Jauns Modelis' }, // Latvian
		// { lang: 'lt', text: 'Naujas Modelis' }, // Lithuanian
		// { lang: 'lb', text: 'Neie Modell' }, // Luxembourgish
		// { lang: 'mk', text: 'Нов Модел' }, // Macedonian
		// { lang: 'mg', text: 'Modely Vaovao' }, // Malagasy
		// { lang: 'ms', text: 'Model Baharu' }, // Malay
		// { lang: 'ml', text: 'പുതിയ മോഡൽ' }, // Malayalam
		// { lang: 'mt', text: 'Mudell Ġdid' }, // Maltese
		// { lang: 'mi', text: 'Tauira Hou' }, // Māori
		// { lang: 'mr', text: 'नवीन मॉडेल' }, // Marathi
		// { lang: 'mn', text: 'Шинэ Загвар' }, // Mongolian
		// { lang: 'my', text: 'မော်ဒယ် အသစ်' }, // Burmese
		// { lang: 'ne', text: 'नयाँ मोडेल' }, // Nepali
		// { lang: 'no', text: 'Ny Modell' }, // Norwegian
		// { lang: 'ps', text: 'نوی ماډل' }, // Pashto
		// { lang: 'fa', text: 'مدل جدید' }, // Persian
		// { lang: 'pl', text: 'Nowy Model' }, // Polish
		// { lang: 'pt', text: 'Novo Modelo' }, // Portuguese
		// { lang: 'pa', text: 'ਨਵਾਂ ਮਾਡਲ' }, // Punjabi
		// { lang: 'ro', text: 'Model Nou' }, // Romanian
		// { lang: 'ru', text: 'Новая Модель' }, // Russian
		// { lang: 'sm', text: 'Fa’ata’ita’iga Fou' }, // Samoan
		// { lang: 'gd', text: 'Modail Ùr' }, // Scottish Gaelic
		// { lang: 'sr', text: 'Нови Модел' }, // Serbian
		// { lang: 'st', text: 'Mohlala O Mocha' }, // Sesotho
		// { lang: 'sn', text: 'Muenzaniso Mutsva' }, // Shona
		// { lang: 'sd', text: 'نئون ماڊل' }, // Sindhi
		// { lang: 'si', text: 'අලුත් ආකෘතිය' }, // Sinhala
		// { lang: 'sk', text: 'Nový Model' }, // Slovak
		// { lang: 'sl', text: 'Nov Model' }, // Slovenian
		// { lang: 'so', text: 'Qaabka Cusub' }, // Somali
		// { lang: 'es', text: 'Nuevo Modelo' }, // Spanish
		// { lang: 'su', text: 'Modél Anyar' }, // Sundanese
		// { lang: 'sw', text: 'Mfano Mpya' }, // Swahili
		// { lang: 'sv', text: 'Ny Modell' }, // Swedish
		// { lang: 'tg', text: 'Модели Нав' }, // Tajik
		// { lang: 'ta', text: 'புதிய மாதிரி' }, // Tamil
		// { lang: 'te', text: 'కొత్త మోడల్' }, // Telugu
		// { lang: 'th', text: 'โมเดล ใหม่' }, // Thai
		// { lang: 'tr', text: 'Yeni Model' }, // Turkish
		// { lang: 'uk', text: 'Нова Модель' }, // Ukrainian
		// { lang: 'ur', text: 'نیا ماڈل' }, // Urdu
		// { lang: 'uz', text: 'Yangi Model' }, // Uzbek
		// { lang: 'vi', text: 'Mô Hình Mới' }, // Vietnamese
		// { lang: 'cy', text: 'Model Newydd' }, // Welsh
		// { lang: 'xh', text: 'Imodeli Entsha' }, // Xhosa
		// { lang: 'yi', text: 'ניו מאָדעל' }, // Yiddish
		// { lang: 'yo', text: 'Awoṣe Tuntun' }, // Yoruba
		// { lang: 'zu', text: 'Imodeli Entsha' } // Zulu
	];
	
	
	

    before(() => {
      cy.visit(URL)
			cy.get('a[class=button-three]') //go to research
			  .click({force: true})  
    })
		
		languages.forEach(({ lang, text }) => {
			it(`Checking for language ${lang}`, () => {
				cy.get(`li[data-lang="${lang}"]`).click({ force: true })
					.then(() => {
						cy.contains(text)
							.should('be.visible');
					});
			});
		});
	
			
});
		
