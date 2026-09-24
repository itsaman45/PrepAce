package com.prepace.auth.dto.evaluation;

import java.util.List;
import java.util.Map;

public class EvaluationMetricsResponse {

    private boolean isMeasuredData;
    private String datasetDescription;
    private ResumeParsingTimeMetrics parsingTimeMetrics;
    private List<AccuracyMetric> accuracyMetrics;
    private SystemPerformanceMetrics systemPerformanceMetrics;
    private Map<String, String> latexTables;
    private Map<String, String> graphAssetUrls;

    public EvaluationMetricsResponse() {}

    public EvaluationMetricsResponse(boolean isMeasuredData, String datasetDescription,
                                     ResumeParsingTimeMetrics parsingTimeMetrics,
                                     List<AccuracyMetric> accuracyMetrics,
                                     SystemPerformanceMetrics systemPerformanceMetrics,
                                     Map<String, String> latexTables,
                                     Map<String, String> graphAssetUrls) {
        this.isMeasuredData = isMeasuredData;
        this.datasetDescription = datasetDescription;
        this.parsingTimeMetrics = parsingTimeMetrics;
        this.accuracyMetrics = accuracyMetrics;
        this.systemPerformanceMetrics = systemPerformanceMetrics;
        this.latexTables = latexTables;
        this.graphAssetUrls = graphAssetUrls;
    }

    public boolean isMeasuredData() {
        return isMeasuredData;
    }

    public void setMeasuredData(boolean measuredData) {
        isMeasuredData = measuredData;
    }

    public String getDatasetDescription() {
        return datasetDescription;
    }

    public void setDatasetDescription(String datasetDescription) {
        this.datasetDescription = datasetDescription;
    }

    public ResumeParsingTimeMetrics getParsingTimeMetrics() {
        return parsingTimeMetrics;
    }

    public void setParsingTimeMetrics(ResumeParsingTimeMetrics parsingTimeMetrics) {
        this.parsingTimeMetrics = parsingTimeMetrics;
    }

    public List<AccuracyMetric> getAccuracyMetrics() {
        return accuracyMetrics;
    }

    public void setAccuracyMetrics(List<AccuracyMetric> accuracyMetrics) {
        this.accuracyMetrics = accuracyMetrics;
    }

    public SystemPerformanceMetrics getSystemPerformanceMetrics() {
        return systemPerformanceMetrics;
    }

    public void setSystemPerformanceMetrics(SystemPerformanceMetrics systemPerformanceMetrics) {
        this.systemPerformanceMetrics = systemPerformanceMetrics;
    }

    public Map<String, String> getLatexTables() {
        return latexTables;
    }

    public void setLatexTables(Map<String, String> latexTables) {
        this.latexTables = latexTables;
    }

    public Map<String, String> getGraphAssetUrls() {
        return graphAssetUrls;
    }

    public void setGraphAssetUrls(Map<String, String> graphAssetUrls) {
        this.graphAssetUrls = graphAssetUrls;
    }

    // Inner DTO classes
    public static class ParsingRow {
        private String method;
        private double averageTimeSec;
        private double minSec;
        private double maxSec;
        private double stdDevSec;
        private String timeReduction;
        private int sampleSize;

        public ParsingRow() {}

        public ParsingRow(String method, double averageTimeSec, double minSec, double maxSec, double stdDevSec, String timeReduction, int sampleSize) {
            this.method = method;
            this.averageTimeSec = averageTimeSec;
            this.minSec = minSec;
            this.maxSec = maxSec;
            this.stdDevSec = stdDevSec;
            this.timeReduction = timeReduction;
            this.sampleSize = sampleSize;
        }

        public String getMethod() { return method; }
        public double getAverageTimeSec() { return averageTimeSec; }
        public double getMinSec() { return minSec; }
        public double getMaxSec() { return maxSec; }
        public double getStdDevSec() { return stdDevSec; }
        public String getTimeReduction() { return timeReduction; }
        public int getSampleSize() { return sampleSize; }
    }

    public static class ResumeParsingTimeMetrics {
        private ParsingRow humanRow;
        private ParsingRow prepaceRow;
        private double percentageTimeReduction;

        public ResumeParsingTimeMetrics() {}

        public ResumeParsingTimeMetrics(ParsingRow humanRow, ParsingRow prepaceRow, double percentageTimeReduction) {
            this.humanRow = humanRow;
            this.prepaceRow = prepaceRow;
            this.percentageTimeReduction = percentageTimeReduction;
        }

        public ParsingRow getHumanRow() { return humanRow; }
        public ParsingRow getPrepaceRow() { return prepaceRow; }
        public double getPercentageTimeReduction() { return percentageTimeReduction; }
    }

    public static class AccuracyMetric {
        private String entityType;
        private double precision;
        private double recall;
        private double f1Score;

        public AccuracyMetric() {}

        public AccuracyMetric(String entityType, double precision, double recall, double f1Score) {
            this.entityType = entityType;
            this.precision = precision;
            this.recall = recall;
            this.f1Score = f1Score;
        }

        public String getEntityType() { return entityType; }
        public double getPrecision() { return precision; }
        public double getRecall() { return recall; }
        public double getF1Score() { return f1Score; }
    }

    public static class PipelineStageRow {
        private String stageName;
        private double averageLatencySec;
        private double minSec;
        private double maxSec;
        private double stdDevSec;
        private double percentageContribution;

        public PipelineStageRow() {}

        public PipelineStageRow(String stageName, double averageLatencySec, double minSec, double maxSec, double stdDevSec, double percentageContribution) {
            this.stageName = stageName;
            this.averageLatencySec = averageLatencySec;
            this.minSec = minSec;
            this.maxSec = maxSec;
            this.stdDevSec = stdDevSec;
            this.percentageContribution = percentageContribution;
        }

        public String getStageName() { return stageName; }
        public double getAverageLatencySec() { return averageLatencySec; }
        public double getMinSec() { return minSec; }
        public double getMaxSec() { return maxSec; }
        public double getStdDevSec() { return stdDevSec; }
        public double getPercentageContribution() { return percentageContribution; }
    }

    public static class SystemPerformanceMetrics {
        private List<PipelineStageRow> stages;
        private double totalEndToEndLatencySec;

        public SystemPerformanceMetrics() {}

        public SystemPerformanceMetrics(List<PipelineStageRow> stages, double totalEndToEndLatencySec) {
            this.stages = stages;
            this.totalEndToEndLatencySec = totalEndToEndLatencySec;
        }

        public List<PipelineStageRow> getStages() { return stages; }
        public double getTotalEndToEndLatencySec() { return totalEndToEndLatencySec; }
    }
}
