-- Ajusta bases ja populadas para separar solicitantes de beneficiarios.
-- Beneficiario continua existindo para atribuicao manual posterior.

MERGE INTO T_LKA_TIPO_CONTATO destino
USING (SELECT 'SOLICITANTE' AS cd_tipo_contato, 'Solicitante' AS nm_tipo_contato FROM dual) origem
ON (destino.cd_tipo_contato = origem.cd_tipo_contato)
WHEN MATCHED THEN
    UPDATE SET destino.nm_tipo_contato = origem.nm_tipo_contato
WHEN NOT MATCHED THEN
    INSERT (cd_tipo_contato, nm_tipo_contato)
    VALUES (origem.cd_tipo_contato, origem.nm_tipo_contato);

UPDATE T_LKA_CONTATO contato
SET contato.id_tipo_contato = (
    SELECT tipo_solicitante.id_tipo_contato
    FROM T_LKA_TIPO_CONTATO tipo_solicitante
    WHERE tipo_solicitante.cd_tipo_contato = 'SOLICITANTE'
)
WHERE contato.id_tipo_contato = (
    SELECT tipo_beneficiario.id_tipo_contato
    FROM T_LKA_TIPO_CONTATO tipo_beneficiario
    WHERE tipo_beneficiario.cd_tipo_contato = 'BENEFICIARIO'
);

DELETE FROM T_LKA_TIPO_CONTATO tipo
WHERE tipo.cd_tipo_contato = 'ORGANIZACAO'
  AND NOT EXISTS (
      SELECT 1
      FROM T_LKA_CONTATO contato
      WHERE contato.id_tipo_contato = tipo.id_tipo_contato
  );

COMMIT;
