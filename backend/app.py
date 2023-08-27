import urllib.request

import torch
from flask import Flask, jsonify, request
from flask_cors import CORS
from PIL import Image
from torch import cuda, load

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["POST"])
def process():
    print(request.files)
    if "file" not in request.files:
        return jsonify({"result": "Please upload file"})
    file = request.files["file"]
    print(type(file))
    img = Image.open(file)
    model = load("models/vision_encoder.pt")
    device = torch.device("cuda" if cuda.is_available() else "cpu")
    if torch.cuda.is_available():
        model.cuda()
    feature_extractor = load("models/feature_extractor.pt")
    # if torch.cuda.is_available():
    #     feature_extractor.cuda()

    tokenizer = load("models/tokenizer.pt")
    if img.mode != "RGB":
        img = img.convert(mode="RGB")

    pixel_values = feature_extractor(images=[img], return_tensors="pt").pixel_values
    pixel_values = pixel_values.to(device)

    max_length = 128
    num_beams = 5

    output_ids = model.generate(
        pixel_values, num_beams=num_beams, max_length=max_length
    )

    # decode the generated prediction
    preds = tokenizer.decode(output_ids[0], skip_special_tokens=True)
    print(preds)
    return jsonify({"result": preds})


if __name__ == "__main__":
    app.run(debug=True, port=8080)
