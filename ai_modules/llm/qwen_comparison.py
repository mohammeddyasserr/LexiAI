import torch

from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    BitsAndBytesConfig
)

model_name = "Qwen/Qwen2.5-7B-Instruct"


bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16
)


tokenizer = AutoTokenizer.from_pretrained(
    model_name
)


model = AutoModelForCausalLM.from_pretrained(
    model_name,
    quantization_config=bnb_config,
    device_map="auto"
)



def ask_llm(prompt):

    messages = [
        {
            "role": "system",
            "content": "You are an expert legal contract analyst."
        },
        {
            "role": "user",
            "content": prompt
        }
    ]


    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True
    )


    inputs = tokenizer(
        text,
        return_tensors="pt"
    ).to(model.device)


    outputs = model.generate(
        **inputs,
        max_new_tokens=1500,
        temperature=0.1
    )


    result = tokenizer.decode(
        outputs[0][inputs.input_ids.shape[1]:],
        skip_special_tokens=True
    )


    return result