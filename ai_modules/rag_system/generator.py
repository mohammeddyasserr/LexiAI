from ollama import Client


class Generator:
    """
    LLM Generator.

    Responsible for sending prompts to the language model
    and returning the generated answer.
    """

    def __init__(
        self,
        model: str = "qwen2.5:3b-instruct",
        host: str = "http://localhost:11434",
    ):

        self.model = model
        self.client = Client(host=host)

    # ======================================================
    # Generate Answer
    # ======================================================

    def generate(
        self,
        prompt: str,
        temperature: float = 0.2,
        max_tokens: int = 1024,
    ) -> str:

        try:

            # -----------------------------------------
            # Verify model exists
            # -----------------------------------------

            models_list = self.client.list()

            available_models = [
                m.get("model", m.get("name", ""))
                for m in models_list.get("models", [])
            ]

            if (
                self.model not in available_models
                and f"{self.model}:latest" not in available_models
            ):

                if not any(
                    self.model in m or m in self.model
                    for m in available_models
                ):

                    raise ValueError(
                        f"Model '{self.model}' is not available.\n"
                        f"Installed models: {available_models}"
                    )

            # -----------------------------------------
            # Debug
            # -----------------------------------------

            print(f"[Generator] Prompt length: {len(prompt)} characters")

            # -----------------------------------------
            # Generate
            # -----------------------------------------

            response = self.client.chat(

                model=self.model,

                # IMPORTANT:
                # The prompt already contains the SYSTEM_PROMPT
                # generated inside RAGPipeline.build_prompt().
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],

                options={

                    "temperature": temperature,

                    "num_predict": max_tokens,

                    "top_p": 0.9,

                    "repeat_penalty": 1.1,

                    "num_ctx": 8192,

                },

            )

            return (
                response
                .get("message", {})
                .get("content", "")
                .strip()
            )

        except Exception as e:

            print(f"[Generator Error] {e}")

            return (
                "An error occurred while generating the response. "
                "Please try again."
            )

    # ======================================================
    # Model Name
    # ======================================================

    def get_model_name(self) -> str:
        return self.model

    # ======================================================
    # Health Check
    # ======================================================

    def is_available(self) -> bool:

        try:

            self.client.list()

            return True

        except Exception:

            return False