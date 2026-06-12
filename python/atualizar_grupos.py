import json

grupos = {
    "A": ["México", "África do Sul", "Coreia do Sul", "República Tcheca"],
    "B": ["Canadá", "Bósnia e Herzegovina", "Catar", "Suíça"],
    "C": ["Brasil", "Marrocos", "Haiti", "Escócia"]
}

with open("dados/grupos.json", "w", encoding="utf-8") as arquivo:
    json.dump(grupos, arquivo, ensure_ascii=False, indent=4)

print("Grupos salvos com sucesso!")

