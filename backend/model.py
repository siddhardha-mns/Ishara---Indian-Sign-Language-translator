from dataclasses import dataclass, field

import torch
import torch.nn as nn
import torch.nn.functional as F
import transformers
from transformers.models.bert.modeling_bert import BertLayer


@dataclass
class TransformerConfig:
    size: str
    input_size: int = 134
    max_position_embeddings: int = field(default=256, repr=False)
    layer_norm_eps: float = field(default=1e-12, repr=False)
    hidden_dropout_prob: float = field(default=0.1, repr=False)
    hidden_size: int = field(default=512, repr=False)
    num_attention_heads: int = field(default=8, repr=False)
    num_hidden_layers: int = field(default=4, repr=False)
    model_config: transformers.BertConfig = field(init=False)

    def __post_init__(self):
        if self.size == "small":
            self.hidden_size = 256
            self.num_attention_heads = 4
            self.num_hidden_layers = 2
        self.model_config = transformers.BertConfig(
            hidden_size=self.hidden_size,
            num_attention_heads=self.num_attention_heads,
            num_hidden_layers=self.num_hidden_layers,
            max_position_embeddings=self.max_position_embeddings,
        )


class PositionEmbedding(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.position_embeddings = nn.Embedding(config.max_position_embeddings, config.hidden_size)
        self.LayerNorm = nn.LayerNorm(config.hidden_size, eps=config.layer_norm_eps)
        self.dropout = nn.Dropout(config.hidden_dropout_prob)
        self.register_buffer("position_ids", torch.arange(config.max_position_embeddings).expand((1, -1)))

    def forward(self, x):
        embeddings = x + self.position_embeddings(self.position_ids[:, :x.size(1)])
        return self.dropout(self.LayerNorm(embeddings))


class Transformer(nn.Module):
    def __init__(self, config, n_classes=50):
        super().__init__()
        self.l1 = nn.Linear(config.input_size, config.hidden_size)
        self.embedding = PositionEmbedding(config)
        self.layers = nn.ModuleList([
            BertLayer(config.model_config)
            for _ in range(config.num_hidden_layers)
        ])
        self.l2 = nn.Linear(config.hidden_size, n_classes)

    def forward(self, x):
        x = self.embedding(self.l1(x))
        for layer in self.layers:
            x = layer(x)[0]
        return self.l2(F.dropout(torch.max(x, dim=1).values, p=0.2))

__all__ = ["Transformer", "TransformerConfig"]
