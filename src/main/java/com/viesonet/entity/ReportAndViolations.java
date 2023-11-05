package com.viesonet.entity;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter @Setter
public class ReportAndViolations {
	List<ViolationsPosts> listPosts;
	List<NumberReport> listNumberReports;
	
}
