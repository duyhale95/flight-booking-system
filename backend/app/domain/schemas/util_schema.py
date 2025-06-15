from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    bearer: str = "bearer"


class TokenPayload(BaseModel):
    sub: str


class Message(BaseModel):
    msg: str
