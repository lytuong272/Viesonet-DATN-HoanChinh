package com.viesonet.controller;

import java.io.FileInputStream;
import java.util.List;

import org.apache.catalina.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import com.viesonet.service.SearchService;

import jakarta.websocket.server.PathParam;

import com.viesonet.dao.UsersDao;
import com.viesonet.entity.Users;

@RestController
@CrossOrigin("*")
public class SearchController {
	@Autowired
	private SearchService SearchService;
	@Autowired
	private UsersDao UsersDao;

	@GetMapping("/user/search/{key}")

	// public ResponseEntity<List<Users>>
	// searchUsersByUsername(@RequestParam("username") String username) {
	// List<Users> users = SearchService.searchUsersByUsername(username);
	// return ResponseEntity.ok(users);
	// }
	public ResponseEntity<List<Users>> searchUsersByUsername(@PathVariable String key) {
		List<Users> users = SearchService.findUserByName(key);
		return ResponseEntity.ok(users);
	}
	// @GetMapping("/search")
	// public ModelAndView getHomePage() {
	// ModelAndView modelAndView = new ModelAndView("search");
	// return modelAndView;
	// }

}
