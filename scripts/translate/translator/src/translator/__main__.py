import sys
import os, os.path as osp
import argparse
import json
import re
import logging
import requests
import random
import traceback
from   pprint import pprint

import googletrans as gt
from   tqdm import tqdm
from   fake_useragent import UserAgent

def pardir(f, level = 1):
    dir_ = osp.realpath(f)
    for i in range(level):
        dir_ = osp.dirname(dir_)
    return dir_

PATHBASE = osp.dirname(__file__)
PATHDATA = osp.join(PATHBASE, 'data')

log      = logging.getLogger('translator')
handler  = logging.FileHandler('translator.log')
handler.setLevel(logging.ERROR)
log.addHandler(handler)

URL_PROXY_LIST = 'https://raw.githubusercontent.com/clarketm/proxy-list/master/proxy-list.txt'

def safe_decode(obj, encoding = 'utf-8'):
	try:
		obj = obj.decode(encoding)
	except Exception:
		pass

	return obj

def get_proxy_list():
	proxies = [ ]

	response = requests.get(URL_PROXY_LIST)
	if response.ok:
		content = safe_decode(response.content)
		lines   = content.split('\n')
		lines   = lines[10:-2]

		for line in lines:
			line   = line.strip()
			proxy  = line.split(" ")

			proxies.append({
				'ip': proxy[0],
				'google': proxy[-1] == "+",
				'https': 'S' in proxy[1]
			})
	else:
		log.error("Response Error: %" % response)

	return proxies

PROXY_LIST = get_proxy_list()

def get_random_requests_proxy():
	proxies = [proxy for proxy in PROXY_LIST if proxy['google']]
	proxy   = random.choice(proxies)

	if proxy['https']:
		protocol = 'https'
		ip       = 'https://%s' % proxy['ip']
	else:
		protocol = 'http'
		ip       = 'https://%s' % proxy['ip']

	dict_   = dict(
		protocol = ip
	)

	return dict_

def get_translator_object():
	proxy      = get_random_requests_proxy()
	user_agent = UserAgent()

	translator = gt.Translator([
		'translate.google.com',
		'translate.google.co.kr',
	], proxies = proxy, user_agent = user_agent.random)

	return translator

def translate(value, language, id_ = None):
	translator   = get_translator_object()

	string 		 = value
	placeholders = re.findall(r"{.*?}", string)

	try:
		translation   = translator.translate(value, dest = language)
		translated    = translation.text

		tplaceholders = re.findall(r"{.*?}", translated)

		for i in range(len(tplaceholders)):
			translated = translated.replace(tplaceholders[i], placeholders[i])

		string        = translated
	except Exception as e:
		errstr = \
		"""
Error:
Language: {language}
ID: {id}
Translated: {translated}
Traceback:
{traceback}
		""".format(
			language   = language,
			id         = id_,
			translated = string,
			traceback  = traceback.format_exc()
		)

		log.error(errstr)

	return string

def get_and_update_language_list(path):
	languages = { }
	current   = [ ]

	with open(osp.join(PATHDATA, 'languages.json')) as f:
		languages = json.load(f)

	languages = dict((l['code'], { 'name': l['name'], 'nativeName': l['nativeName'] })
		for l in languages)
	supported = [ ]

	for code, language in gt.LANGUAGES.items():
		item = languages.get(code)

		if item:
			name   = item['name']
			native = item['nativeName']
		else:
			name   = language.capitalize()
			native = name

		supported.append({
			'code': code,
			'name': name,
			'nativeName': native
		})

	with open(path, 'w') as f:
		json.dump(supported, f, indent = 4, ensure_ascii = False)

	return supported

def build_languages(pdata, target, languages = [ ]):
	data = { }

	with open(pdata) as f:
		data = json.load(f)

	count   = len(languages)

	for i, language in enumerate(languages):
		print("Language [%s] (%s of %s)" % (language, i + 1, count))
		lpath = os.path.join(target, '%s.json' % language)
		ldata = { }

		if os.path.exists(lpath):
			with open(lpath) as f:
				ldata = json.load(f)

		for id_, value in data.items():
			if id_ not in ldata:
				ldata[id_] = translate(value, language, id_ = id_)
				print("[%s] %s: %s" % (language, id_, ldata[id_]))

		with open(lpath, 'w') as f:
			json.dump(ldata, f, indent = 4, ensure_ascii = False)

def get_parser():
	parser = argparse.ArgumentParser()
	parser.add_argument("-l", "--languages",
		required = True,
		help     = "Path to Languages"
	)
	parser.add_argument("-d", "--data",
		required = True,
		help     = "Path to Data"
	)
	parser.add_argument("-t", "--target",
		required = True,
		help     = "Path to Target Directory"
	)

	return parser

def main(args = []):
	args   = args or sys.argv[1:]
	parser = get_parser()
	args   = parser.parse_args(args)

	langs  = get_and_update_language_list(args.languages)

	build_languages(args.data, args.target, [l['code'] for l in langs])

if __name__ == "__main__":
	main()