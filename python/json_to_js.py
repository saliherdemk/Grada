import json
import os

import json
import os

def json_to_js(input_path):
    chunk_size = 6000
    output_path = 'Data/mnist/'
    output_x_directory = output_path + 'xData'
    output_y_directory = output_path + 'yData.js'

    os.makedirs(output_x_directory, exist_ok=True)

    with open(input_path, 'r', encoding='utf-8') as json_file:
        data = json.load(json_file)

        x_datas = data['xDatas']
        y_datas = data['yDatas']

        for i in range(0, len(x_datas), chunk_size):
            chunk = x_datas[i:i + chunk_size]
            output_file_path = os.path.join(output_x_directory, f'chunk_{i // chunk_size + 1}.js')

            with open(output_file_path, 'w', encoding='utf-8') as js_file:
                js_file.write('const xData = ')
                json.dump(chunk, js_file, indent=2)
                js_file.write(';\nexport default xData;') 

            print(f'Created: {output_file_path}')

        with open(output_y_directory, 'w', encoding='utf-8') as js_file:
            js_file.write('const yData = ')
            json.dump(y_datas, js_file, indent=2)
            js_file.write(';\nexport default yData;') 

input_file_path = 'Data/mnist.json'
json_to_js(input_file_path)



