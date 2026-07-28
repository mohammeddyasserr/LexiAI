from ollama import Client


class Generator:
    """
    LLM Generator.

    Responsible for sending prompts to the language model
    and returning the generated answer.

    Current Backend:
        - Ollama (Qwen2.5)

    Future:
        - OpenAI
        - Azure OpenAI
        - Claude
        - Gemini
    """

    def __init__(
        self,
        model: str = "qwen2.5:1.5b",
        host: str = "http://localhost:11434"
    ):

        self.model = model

        self.client = Client(host=host)

    # ======================================================

    def generate(
        self,
        prompt: str,
        temperature: float = 0.2,
        max_tokens: int = 512
    ) -> str:

        response = self.client.chat(

            model=self.model,

            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],

            options={
                "temperature": temperature,
                "num_predict": max_tokens
            }

        )

        return response["message"]["content"].strip()

    # ======================================================

    def get_model_name(self) -> str:

        return self.model

    # ======================================================

    def is_available(self) -> bool:
        """
        Check whether Ollama server is running.
        """

        try:

            self.client.list()

            return True

        except Exception:

            return False